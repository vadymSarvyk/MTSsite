'use client';
import React, { useEffect, useState } from 'react';
import '@/styles/Header.css'

const Header = () => {
    const [banner, setBanner] = useState('/images/people.jpg');

    useEffect(() => {
        fetch('/api/banner')
            .then(res => res.json())
            .then(data => {
                if (data.bannerUrl) {
                    setBanner(data.bannerUrl);
                }
            });
    }, []);

    return (
        <div id="main" className="header">
            <div className="header-background">
                <img src={banner} alt="#" />
            </div>
            <div className="header-content">
                <div className="header-light-zone">
                    <div className="header-logo">
                        <img src="/images/MTLogo_bg.png" alt="Logo" />
                    </div>
                    <div className="header-title">
                        <h1>Mother Tongue School - школа іноземних мов</h1>
                    </div>
                    <div className="quote-section">
                        <p className="quote">“Do you know what a foreign accent is? It's a sign of bravery.”</p>
                        <p className="quote">“Знаєте, що таке акцент? Це ознака хоробрості.“</p>
                        <p className="quote-author">- Amy Chua</p>
                    </div>
                    <div className="button-join-us-container">
                        <a href="#contact" className="join-button">ПРИЄДНАТИСЯ ДО НАС</a>
                    </div>
                </div>
                <div className="social-section">
                    <div className="social-icons">
                        <a href="https://t.me/mtschool_admin" target="_blank" className="social-icon">
                            <img src="/images/telegram-128.png" alt="Telegram" />
                        </a>
                        <a href="https://www.facebook.com/mtschool.kr" target="_blank" className="social-icon">
                            <img src="/images/facebook-128.png" alt="Facebook" />
                        </a>
                        <a href="https://www.instagram.com/mtschool_kr" target="_blank" className="social-icon">
                            <img src="/images/instagram-2-128.png" alt="Instagram" />
                        </a>
                    </div>
                    <div className="contact-info">
                        <b>+38(097)-111-78-95</b><br />
                        <b>м. Кривий Ріг, вул. Героїв АТО, 11</b>
                        <br />
                        <b>м. Кривий Ріг, вул. Мусоргського, 20</b>
                        <div className="button-join-us-container">
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSelerd0rrSDl2TF0wbaJjpIkfUoDVppXkI0yVOuHRDMiMLW6w/viewform" target="_blank" className="join-button test-button">ПРОЙТИ ТЕСТ З АНГЛІЙСЬКОЇ МОВИ</a>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
