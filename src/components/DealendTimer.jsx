import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './styles.css';

const DealendTimer = () => {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

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
            <Row className="align-items-center justify-content-between" xs={1} lg={2} xl={2}>
                <Col className="text-center text-lg-start mb-3 mb-lg-0">
                    <h2 className="mb-2" style={{ fontWeight: 700 }}>
                        Day Of The <span style={{ color: '#5caf90' }}>Deal</span>
                    </h2>
                    <p style={{ color: '#888' }}>Don't wait. The time will never be just right.</p>
                </Col>
                <Col className="d-flex justify-content-center justify-content-lg-end align-items-center">
                    <div className="dealend-timer">
                        <span className="time-block">
                            <span className="time">{days}</span>
                            <span className="label">Days</span>
                        </span>
                        <span className="time-block">
                            <span className="time">{String(hours).padStart(2, '0')}</span>
                        </span>
                        <span className="dots">:</span>
                        <span className="time-block">
                            <span className="time">{String(minutes).padStart(2, '0')}</span>
                        </span>
                        <span className="dots">:</span>
                        <span className="time-block">
                            <span className="time">{String(seconds).padStart(2, '0')}</span>
                        </span>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default DealendTimer;
