import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './styles.css';
import { useLanguage } from '../context/LanguageContext';

const DealendTimer = () => {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const { currentLanguage } = useLanguage();

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 26);
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
                clearInterval(interval);
                setDays(0);
                setHours(0);
                setMinutes(0);
                setSeconds(0);
            } else {
                setDays(Math.floor(difference / (1000 * 60 * 60 * 24)));
                setHours(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                setMinutes(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)));
                setSeconds(Math.floor((difference % (1000 * 60)) / 1000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
      <Container className="py-4 fadeInUp">
        <Row className="align-items-center" xs={1} lg={2} xl={2}>
          <Col
            className={`text-center ${
              currentLanguage === "ar" ? "text-lg-end" : "text-lg-start"
            } mb-3 mb-lg-0`}
          >
            <h2 className="mb-2" style={{ fontWeight: 700 }}>
              {currentLanguage === "ar" ? (
                <>
                  عروض{" "}
                  <span style={{ color: "#5caf90", fontSize: "2rem" }}>
                    حصرية
                  </span>
                </>
              ) : (
                <>
                  Day Of The{" "}
                  <span style={{ color: "#5caf90", fontSize: "2rem" }}>
                    Deal
                  </span>
                </>
              )}
            </h2>
            <p style={{ color: "#888" }}>
              {currentLanguage === "ar"
                ? "لا تنتظر. الوقت لن يكون مناسباً أبد"
                : "Don't wait. The time will never be just right."}
            </p>
          </Col>
          <Col
            className={`d-flex ${
              currentLanguage === "ar"
                ? "!justify-content-lg-start"
                : "justify-content-lg-end"
            } justify-content-center align-items-center`}
          >
            <div className="dealend-timer">
              <span className="time-block">
                <span className="time">{days} </span>
                <span className="label">
                  {currentLanguage === "ar" ? " يوم" : "Days"}{" "}
                </span>
              </span>
              <span className="time-block">
                <span className="time">{String(hours).padStart(2, "0")}</span>
                <span className="label">
                  {currentLanguage === "ar" ? "ساعة" : "Hours"}
                </span>
              </span>
              <span className="dots">:</span>
              <span className="time-block">
                <span className="time">{String(minutes).padStart(2, "0")}</span>
                <span className="label">
                  {currentLanguage === "ar" ? "دقيقة" : "Minutes"}
                </span>
              </span>
              <span className="dots">:</span>
              <span className="time-block">
                <span className="time">{String(seconds).padStart(2, "0")}</span>
                <span className="label">
                  {currentLanguage === "ar" ? "ثانية" : "Seconds"}
                </span>
              </span>
            </div>
          </Col>
        </Row>
      </Container>
    );
};

export default DealendTimer;
