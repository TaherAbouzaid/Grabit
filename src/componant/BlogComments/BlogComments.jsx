import { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../firebase/config";
import {
  collection, query, where, getDocs, doc, getDoc, arrayUnion, runTransaction, increment
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

import "../BlogContent/BlogContent.css";

export default function BlogComments({ postId }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchUserProfile = async (uid) => {
    if (userCache[uid]) return userCache[uid];
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const profile = {
          displayName: userData.fullName || userData.email || uid,
          photoURL: userData.profileImage || "/placeholder.svg?height=50&width=50",
        };
        setUserCache(prev => ({ ...prev, [uid]: profile }));
        return profile;
      }
      return { displayName: uid, photoURL: "/placeholder.svg?height=50&width=50" };
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return { displayName: uid, photoURL: "/placeholder.svg?height=50&width=50" };
    }
  };

  useEffect(() => {
    if (!isOnline) {
      setError(t("blogComments.errors.offline"));
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        setLoading(true);
        console.log("Fetching comments for postId:", postId);
        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
        const commentsSnap = await getDocs(commentsQuery);

        const commentsData = [];
        for (const commentDoc of commentsSnap.docs) {
          const commentData = commentDoc.data();
          const userProfile = await fetchUserProfile(commentData.authorId);

          const repliesQuery = query(collection(db, "replies"), where("commentId", "==", commentDoc.id));
          const repliesSnap = await getDocs(repliesQuery);
          const replies = [];
          for (const replyDoc of repliesSnap.docs) {
            const replyData = replyDoc.data();
            const replyUserProfile = await fetchUserProfile(replyData.userId);
            replies.push({
              id: replyDoc.id,
              content: replyData.content,
              date: replyData.createdAt?.toDate().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }) || "N/A",
              name: replyUserProfile.displayName,
              avatar: replyUserProfile.photoURL,
              likesCount: replyData.likesCount || 0,
              hasLiked: user
                ? (await getDocs(query(
                    collection(db, "likes"),
                    where("targetId", "==", replyDoc.id),
                    where("targetType", "==", "reply"),
                    where("userId", "==", user.uid)
                  ))).empty === false
                : false,
            });
          }

          commentsData.push({
            id: commentDoc.id,
            name: userProfile.displayName,
            avatar: userProfile.photoURL,
            date: commentData.createdAt?.toDate().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) || "N/A",
            content: commentData.content,
            likesCount: commentData.likesCount || 0,
            replyCount: replies.length,
            replies,
            hasLiked: user
              ? (await getDocs(query(
                  collection(db, "likes"),
                  where("targetId", "==", commentDoc.id),
                  where("targetType", "==", "comment"),
                  where("userId", "==", user.uid)
                ))).empty === false
              : false,
          });
        }

        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError(t("blogComments.errors.failedToLoad", { message: err.message || t("blogComments.errors.tryAgain") }));
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, isOnline, user, t]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError(t("blogComments.errors.loginRequired"));
      return;
    }
    if (!isOnline) {
      setError(t("blogComments.errors.offlineAction"));
      return;
    }
    if (!newComment.trim()) return;

    try {
      const commentRef = doc(collection(db, "comments"));
      const postRef = doc(db, "posts", postId);
      const userProfile = await fetchUserProfile(user.uid);
      await runTransaction(db, async (transaction) => {
        transaction.set(commentRef, {
          authorId: user.uid,
          userId: user.uid,
          content: newComment,
          createdAt: new Date(),
          updatedAt: new Date(),
          likesCount: 0,
          postId,
          replyIds: [],
        });
        transaction.update(postRef, { commentIds: arrayUnion(commentRef.id) });
      });

      setComments([...comments, {
        id: commentRef.id,
        name: userProfile.displayName,
        avatar: userProfile.photoURL,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        content: newComment,
        likesCount: 0,
        replyCount: 0,
        replies: [],
        hasLiked: false,
      }]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(t("blogComments.errors.failedToAddComment", { message: err.message || t("blogComments.errors.tryAgain") }));
    }
  };

  const handleReplySubmit = async (commentId, replyContent) => {
    if (!user) {
      setError(t("blogComments.errors.loginRequired"));
      return;
    }
    if (!isOnline) {
      setError(t("blogComments.errors.offlineAction"));
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const replyRef = doc(collection(db, "replies"));
      const commentRef = doc(db, "comments", commentId);
      const userProfile = await fetchUserProfile(user.uid);
      await runTransaction(db, async (transaction) => {
        transaction.set(replyRef, {
          commentId,
          content: replyContent,
          createdAt: new Date(),
          updatedAt: new Date(),
          likesCount: 0,
          userId: user.uid,
        });
        transaction.update(commentRef, { replyIds: arrayUnion(replyRef.id) });
      });

      setComments(comments.map(comment => comment.id === commentId ? {
        ...comment,
        replyCount: comment.replyCount + 1,
        replies: [...comment.replies, {
          id: replyRef.id,
          content: replyContent,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          name: userProfile.displayName,
          avatar: userProfile.photoURL,
          likesCount: 0,
          hasLiked: false,
        }],
      } : comment));
      setReplyInputs({ ...replyInputs, [commentId]: "" });
    } catch (err) {
      console.error("Error adding reply:", err);
      setError(t("blogComments.errors.failedToAddReply", { message: err.message || t("blogComments.errors.tryAgain") }));
    }
  };

  const handleLike = async (targetId, targetType, isComment, commentId) => {
    if (!user) {
      setError(t("blogComments.errors.loginRequired"));
      return;
    }
    if (!isOnline) {
      setError(t("blogComments.errors.offlineAction"));
      return;
    }

    try {
      const likeRef = doc(collection(db, "likes"));
      const targetRef = doc(db, isComment ? "comments" : "replies", targetId);
      await runTransaction(db, async (transaction) => {
        const targetSnap = await transaction.get(targetRef);
        if (!targetSnap.exists()) throw new Error(t("blogComments.errors.targetNotFound", { type: targetType }));

        const likesQuery = query(
          collection(db, "likes"),
          where("targetId", "==", targetId),
          where("targetType", "==", targetType),
          where("userId", "==", user.uid)
        );
        const likesSnap = await getDocs(likesQuery);

        if (likesSnap.empty) {
          transaction.set(likeRef, {
            createdAt: new Date(),
            likeId: likeRef.id,
            targetId,
            targetType,
            userId: user.uid,
          });
          transaction.update(targetRef, { likesCount: increment(1) });
        } else {
          likesSnap.forEach((doc) => transaction.delete(doc.ref));
          transaction.update(targetRef, { likesCount: increment(-1) });
        }
      });

      setComments(comments.map(comment => {
        if (isComment && comment.id === targetId) {
          return {
            ...comment,
            likesCount: comment.hasLiked ? comment.likesCount - 1 : comment.likesCount + 1,
            hasLiked: !comment.hasLiked,
          };
        }
        if (!isComment && comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === targetId
                ? {
                    ...reply,
                    likesCount: reply.hasLiked ? reply.likesCount - 1 : reply.likesCount + 1,
                    hasLiked: !reply.hasLiked,
                  }
                : reply
            ),
          };
        }
        return comment;
      }));
    } catch (err) {
      console.error(`Error liking ${targetType}:, err`);
      setError(t("blogComments.errors.failedToLike", { type: targetType, message: err.message || t("blogComments.errors.tryAgain") }));
    }
  };

  if (loading) {
    return <Container className="blog-comments py-4"><div className="text-center">{t("blogComments.loading")}</div></Container>;
  }

  if (error) {
    return <Container className="blog-comments py-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="blog-comments py-4">
      <div className="comments-section p-3 p-md-4 rounded">
        <h4 className="commentNumber mb-4">{t("blogComments.commentsTitle", { count: comments.length })}</h4>

        {comments.map((comment) => (
          <div key={comment.id} className="comment-item d-flex flex-column flex-md-row mb-4 gap-2">
            <div className="comment-avatar">
              <img src={comment.avatar} alt={comment.name} className="rounded-circle" />
            </div>
            <div className="comment-content flex-grow-1">
              <h5 className="mb-1">{comment.name}</h5>
              <div className="text-muted small mb-2">{comment.date}</div>
              <p>{comment.content}</p>
              <div className="d-flex gap-2 mb-2">
                <Button
                  variant={comment.hasLiked ? "outline-danger" : "outline-primary"}
                  size="sm"
                  onClick={() => handleLike(comment.id, "comment", true)}
                  disabled={!user || !isOnline}
                >
                  {comment.hasLiked ? t("blogComments.unlike") : t("blogComments.like")} ({comment.likesCount})
                </Button>
                <Button
                  variant="link"
                  className="text-success p-0"
                  onClick={() => setReplyInputs({ ...replyInputs, [comment.id]: replyInputs[comment.id] || "" })}
                >
                  {t("blogComments.reply")} ({comment.replyCount})
                </Button>
              </div>
              {replyInputs[comment.id] !== undefined && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReplySubmit(comment.id, replyInputs[comment.id]);
                  }}
                  className="mb-3"
                >
                  <Form.Group controlId={`replyContent-${comment.id}`}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={replyInputs[comment.id]}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                      placeholder={t("blogComments.replyPlaceholder")}
                      required
                      className="w-100"
                    />
                  </Form.Group>
                  <Button variant="success" type="submit" size="sm" className="mt-2">
                    {t("blogComments.postReply")}
                  </Button>
                </Form>
              )}
              {comment.replies.map((reply) => (
                <div key={reply.id} className="comment-item d-flex flex-column flex-md-row mb-2 ms-2 ms-md-4 gap-2">
                  <div className="comment-avatar">
                    <img src={reply.avatar} alt={reply.name} className="rounded-circle" />
                  </div>
                  <div className="comment-content">
                    <h6 className="mb-1">{reply.name}</h6>
                    <div className="text-muted small mb-1">{reply.date}</div>
                    <p>{comment.content}</p>
                    <Button
                      variant={reply.hasLiked ? "outline-danger" : "outline-primary"}
                      size="sm"
                      onClick={() => handleLike(reply.id, "reply", false, comment.id)}
                      disabled={!user || !isOnline}
                    >
                      {reply.hasLiked ? t("blogComments.unlike") : t("blogComments.like")} ({reply.likesCount})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="comment-form mt-5">
          <h4 className="commentNumber mb-4">{t("blogComments.leaveCommentTitle")}</h4>
          <Form onSubmit={handleCommentSubmit}>
            <Form.Group className="mb-3" controlId="commentContent">
              <Form.Label>{t("blogComments.commentLabel")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                disabled={!user || !isOnline}
                className="w-100"
              />
            </Form.Group>
            <Button variant="success" type="submit" disabled={!user || !isOnline}>
              {t("blogComments.postComment")}
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
}