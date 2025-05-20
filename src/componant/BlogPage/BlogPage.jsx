"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"; // Adjust path
import { db } from "../../firebase/config"; // Adjust path
import { collection, getDocs } from "firebase/firestore";
import "./BlogPage.css";

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const postsPerPage = 6;

  useEffect(() => {
    // Monitor network status
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
      setError("You are offline. Posts will load when you reconnect.");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Querying posts collection");
        const postsRef = collection(db, "posts");
        const querySnapshot = await getDocs(postsRef);
        console.log("Query result:", querySnapshot.docs.map(doc => doc.data()));

        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          image: doc.data().image || "/placeholder.svg",
          title: doc.data().title || "Untitled",
          date: doc.data().createdAt?.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) || "N/A",
          category: "General", // Placeholder; adjust if category exists
          excerpt: doc.data().content?.substring(0, 100) + (doc.data().content?.length > 100 ? "..." : "") || "No content available",
        }));

        setPosts(fetchedPosts);
        if (fetchedPosts.length === 0) {
          setError("No posts found.");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        if (err.message.includes("client is offline")) {
          setError("You are offline. Posts will load when you reconnect.");
        } else {
          setError(`Failed to load posts: ${err.message || "Please try again."}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isOnline]);

  // Pagination logic
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="py-5 bg-white">
        <Container>
          <div className="text-center">Loading posts...</div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-5 bg-white">
        <Container>
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-5 bg-white">
      <Container>
        <Row>
          {currentPosts.map((post) => (
            <Col key={post.id} md={4} className="mb-4">
              <div className="blog-card h-100">
                <div className="blog-image mb-3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="img-fluid rounded"
                    loading="lazy"
                  />
                </div>
                <div className="blog-content">
                  <div className="blog-meta text-muted mb-2">
                    {post.date} - {post.category}
                  </div>
                  <h3 className="blog-title mb-3 fw-bold">{post.title}</h3>
                  <p className="blog-excerpt text-muted">{post.excerpt}</p>
                  <Link
                    to={`/BlogPage/${post.id}`}
                    className="blog-link text-decoration-none"
                    aria-label={`Read more about ${post.title}`}
                  >
                    Read More »
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {posts.length > 0 && (
          <Row className="mt-5">
            <Col className="d-flex justify-content-between align-items-center">
              <div className="pagination-info text-muted">
                Showing {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, posts.length)} of {posts.length} item(s)
              </div>
              <div className="pagination-controls d-flex">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  aria-label="Previous page"
                >
                  Prev
                </button>

                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`pagination-btn ${currentPage === number + 1 ? "active" : ""}`}
                    aria-label={`Page ${number + 1}`}
                    aria-current={currentPage === number + 1 ? "page" : undefined}
                  >
                    {number + 1}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`pagination-btn next-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}