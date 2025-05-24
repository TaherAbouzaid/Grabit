import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import PostCart from "./PostCart";
import {
  collection,
  getDocs,
  query,

  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Spinner } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
function PostSliderHome() {

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const settings = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 3000,
    cssEase: "linear",
    centerMode: true,
    centerPadding: "0px",
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 580,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Container>
      <div style={{ minHeight: "420px", position: "relative" }}>
        {isLoading ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Spinner
              animation="border"
              variant="success"
              style={{ width: "3rem", height: "3rem" }}
            />
          </div>
        ) : (
          <div className="d-flex flex-column py-4 mb-4">
            <div className="d-flex flex-row justify-content-between align-items-center  flex-wrap">
              <div>
                <h3>{t("postHome.latestPosts")}</h3>
                <p>{t("postHome.checkOutOurLatestBlogPosts")}</p>
              </div>

              <button
                style={{ backgroundColor: "#5cac94", color: "#fff" }}
                className="btn "
                onClick={() => navigate("/BlogPage")}
              >
                {t("postHome.viewAll")}
              </button>
            </div>
            <Slider {...settings}>
              {posts.map((post) => (
                <div key={post.id} className="p-2">
                  <PostCart post={post} />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </Container>
  );
}

export default PostSliderHome;
