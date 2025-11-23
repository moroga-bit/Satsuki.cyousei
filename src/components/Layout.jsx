import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="header-content">
                    <Link to="/" className="header-link">
                        <img src={logo} alt="Rotary Logo" className="header-logo" />
                        <h1 className="app-title">宇都宮さつきロータリークラブ</h1>
                    </Link>
                </div>
            </header>
            <main className="layout-main">
                {children}
            </main>
            <footer className="layout-footer">
                <p>&copy; {new Date().getFullYear()} 宇都宮さつきロータリークラブ</p>
            </footer>
        </div>
    );
};

export default Layout;
