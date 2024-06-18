import { Outlet, NavLink, Link } from "react-router-dom";
import React, { HTMLProps } from 'react';

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";

interface VideoProps extends HTMLProps<HTMLVideoElement> {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    playsinline?: boolean;
    className?: string;
}
const Layout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>DTDL CustomerCare</h3>
                    </Link>
                    <nav>
                        <ul className={styles.headerNavList}>
                            
                            <li className={styles.headerNavLeftMargin}>
                                <a href="https://github.com/cosmosdb" target={"_blank"} title="Github repository link">
                                    <img
                                        src={github}
                                        alt="Github logo"
                                        aria-label="Link to github repository"
                                        width="20px"
                                        height="20px"
                                        className={styles.githubLogo}
                                    />
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <h4 className={styles.headerRightText}>DTDL-CustomerCare</h4>
                </div>
                <div className={styles.headerVideo}>
            <video
                autoPlay
                muted
                loop
                playsInline
                className={styles.headerVideoTransform}
            >
                <source src="https://static.dtdl.in/live/images/bgOg.mp4" type="video/mp4" />
            </video>
        </div>
            </header>

            <Outlet />
        </div>
    );
};

export default Layout;
