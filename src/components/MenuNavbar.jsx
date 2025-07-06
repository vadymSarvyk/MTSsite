'use client';
import React, { useState } from 'react';
import '@/styles/MenuNavbar.css';

function MenuNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="nav-header">
                    <div className="navbar-logo">
                        <a href="#main">
                            <img src="/MTLogo_bg.png" alt="Logo"/>
                        </a> 
                    </div>
                    <button className="navbar-toggle" onClick={toggleMenu}>
                        ☰
                    </button>
                </div>
                <ul className={`navbar-menu ${isOpen ? 'open' : ''}`}>
                    <li><a href="#about">Про нас</a></li>
                    <li><a href="#programs">Програми</a></li>
                    <li><a href="#events">Івенти</a></li>
                   /* <li><a href="/art-english">ART & ENGLISH</a></li>*/
                    <li><a href="#contact">Контакти</a></li>
                </ul>
                <div className={`navbar-extra ${isOpen ? 'open' : ''}`}>
                    <div className="extra-content">
                        <div className="images-row">
                            <a href="http://t.me/MotherTongueSchool">
                                <img src="/images/telegram-128.png" alt="Telegram" />
                            </a>
                            <a href="https://www.facebook.com/mothertongueschool" >
                                <img src="/images/facebook-128.png" alt="Facebook" />
                            </a>
                            <a href="https://www.instagram.com/mothertongueschool">
                                <img src="/images/instagram-2-128.png" alt="Instagram" />
                            </a>
                        </div>
                        <div className="text-center">
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
        </nav>
    );
}

export default MenuNavbar;
