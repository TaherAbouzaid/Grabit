import { useState, useEffect } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import BlogComments from "../BlogComments/BlogComments";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, runTransaction } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import "./BlogContent.css";
import { BiSolidLike } from "react-icons/bi";
import { AiTwotoneLike } from "react-icons/ai";

// تعريف الصورة الافتراضية في بداية الملف
const DEFAULT_POST_IMAGE = "https://images.pexels.com/photos/31067936/pexels-photo-31067936/free-photo-of-minimalist-architectural-white-wall-with-blue-sky.jpeg";

export default function BlogContent() {
  const { postId } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [post, setPost] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    if (!isOnline) {
      setError(t("blogContent.errors.offline"));
      setLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        setLoading(true);
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          setError(t("blogContent.errors.postNotFound"));
          setPost(null);
          return;
        }

        await updateDoc(postRef, { views: increment(1) });

        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
        const commentsSnap = await getDocs(commentsQuery);
        const commentCount = commentsSnap.size;

        let userHasLiked = false;
        if (user) {
          const likesQuery = query(
            collection(db, "likes"),
            where("targetId", "==", postId),
            where("targetType", "==", "post"),
            where("userId", "==", user.uid)
          );
          const likesSnap = await getDocs(likesQuery);
          userHasLiked = !likesSnap.empty;
        }

        const postData = postSnap.data();
        setPost({
          id: postSnap.id,
          title: postData.title || t("blogContent.untitled"),
          image: postData.image || DEFAULT_POST_IMAGE,
          content: postData.content?.split("\n").filter(p => p.trim()) || [t("blogContent.noContent")],
          date: postData.createdAt?.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) || "N/A",
          category: "General",
          authorId: postData.authorId || "Unknown",
          likesCount: postData.likesCount || 0,
          views: postData.views || 0,
        });
        setCommentCount(commentCount);
        setHasLiked(userHasLiked);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(t("blogContent.errors.failedToLoad", { message: err.message || t("blogContent.errors.tryAgain") }));
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId, isOnline, user, t]);

  const handleLikePost = async () => {
    if (!user) {
      setError(t("blogContent.errors.loginRequired"));
      return;
    }
    if (!isOnline) {
      setError(t("blogContent.errors.offlineAction"));
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      const likeRef = doc(collection(db, "likes"));
      await runTransaction(db, async (transaction) => {
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) throw new Error(t("blogContent.errors.postNotFound"));

        const likesQuery = query(
          collection(db, "likes"),
          where("targetId", "==", postId),
          where("targetType", "==", "post"),
          where("userId", "==", user.uid)
        );
        const likesSnap = await getDocs(likesQuery);

        if (hasLiked) {
          if (!likesSnap.empty) {
            likesSnap.forEach((doc) => transaction.delete(doc.ref));
            transaction.update(postRef, { likesCount: increment(-1) });
          }
        } else {
          if (likesSnap.empty) {
            transaction.set(likeRef, {
              createdAt: new Date(),
              likeId: likeRef.id,
              targetId: postId,
              targetType: "post",
              userId: user.uid,
            });
            transaction.update(postRef, { likesCount: increment(1) });
          }
        }
      });

      setHasLiked(!hasLiked);
      setPost((prev) => ({
        ...prev,
        likesCount: prev.likesCount + (hasLiked ? -1 : 1),
      }));
    } catch (err) {
      console.error("Error liking post:", err);
      setError(t("blogContent.errors.failedToLike", { message: err.message || t("blogContent.errors.tryAgain") }));
    }
  };

  if (loading) {
    return (
      <Container className="blog-content py-4">
        <div className="text-center">{t("blogContent.loading")}</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="blog-content py-4">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="blog-content py-4">
        <Alert variant="info" className="text-center">{t("blogContent.errors.postNotFound")}</Alert>
      </Container>
    );
  }

  return (
    <Container className="blog-content py-4">
      <div className="featured-image mb-4">
        <img
          src={post.image}
          alt={post.title}
          className="img-fluid rounded"
          style={{ objectFit: "cover", maxHeight: "400px", width: "100%" }}
          loading="lazy"
        />
      </div>

      <div className="blog-meta d-flex flex-column flex-md-row align-items-start align-items-md-center mb-3 gap-2">
        <div
          onClick={handleLikePost}
          className={`like-btn px-2 py-1 ${hasLiked ? "text-primary" : "text-muted"}`}
          style={{ cursor: user && isOnline ? "pointer" : "not-allowed" }}
          aria-disabled={!user || !isOnline}
        >
          {hasLiked ? <BiSolidLike className="fs-4" /> : <AiTwotoneLike className="fs-4" />}
        </div>
        <span>| {post.likesCount} {post.likesCount === 1 ? t("blogContent.like") : t("blogContent.likes")}</span>
        <span>| {commentCount} {commentCount === 1 ? t("blogContent.comment") : t("blogContent.comments")}</span>
        <span>| {post.views} {post.views === 1 ? t("blogContent.view") : t("blogContent.views")}</span>
        <span className="text-muted">| {post.date}</span>
      </div>

      <h2 className="blog-title mb-4">{post.title}</h2>

      <div className="blog-text text-muted">
        {post.content.map((paragraph, index) => (
          <p key={index} className={index === 2 ? "fst-italic mt-4" : ""}>{paragraph}</p>
        ))}
        {post.content.length > 3 && <p>{post.content.slice(3).join(" ")}</p>}
      </div>

      <BlogComments postId={post.id} />
    </Container>
  );
}
