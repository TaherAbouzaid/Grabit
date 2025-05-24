import React from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PostCart = ({ post }) => {
  const { t } = useTranslation();

  // Inline styles to prevent conflicts with other components
  const styles = {
    blogCard: {
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #eee",
      height: "100%"
    },
    blogImage: {
      overflow: "hidden",
      height: "200px"
    },
    blogImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.5s ease"
    },
    blogContent: {
      padding: "1.25rem"
    },
    blogMeta: {
      fontSize: "0.85rem",
      color: "#6c757d",
      marginBottom: "0.5rem",
      display: "flex",
      justifyContent: "space-between"
    },
    blogTitle: {
      fontSize: "1.25rem",
      lineHeight: "1.4",
      fontWeight: "bold",
      marginBottom: "1rem",
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical"
    },
    blogLink: {
      color: "#5cac94",
      fontWeight: "500",
      textDecoration: "none"
    },
    statsIcon: {
      marginRight: "5px"
    }
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    // Check if timestamp is a Firestore timestamp with toDate method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <Card style={styles.blogCard}>
      <div style={styles.blogImage}>
        <img
          src={
            post.image ||
            'https://images.pexels.com/photos/31067936/pexels-photo-31067936/free-photo-of-minimalist-architectural-white-wall-with-blue-sky.jpeg'
          }
          alt={post.title}
          className="img-fluid rounded"
          style={styles.blogImg}
          loading="lazy"
        />
      </div>
      <Card.Body style={styles.blogContent}>
        <div style={styles.blogMeta}>
          <span>{formatDate(post.createdAt)}</span>
          <span>
            <i className="bi bi-eye" style={styles.statsIcon}></i> {post.views || 0}
            <i className="bi bi-heart-fill ms-2" style={styles.statsIcon}></i> {post.likesCount || 0}
          </span>
        </div>
        <h3 style={styles.blogTitle}>{post.title || t("blogPage.untitled")}</h3>
        <Link
          to={`/BlogPage/${post.id}`}
          style={styles.blogLink}
          aria-label={t("blogPage.readMore", { title: post.title })}
        >
          {t("blogPage.readMoreLink")} 
        </Link>
      </Card.Body>
    </Card>
  );
};

export default PostCart;
