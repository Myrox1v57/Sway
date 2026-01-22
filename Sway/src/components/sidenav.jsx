import React from "react";
import { NavLink } from "react-router-dom";
import "../component_styles/sidenav.css";

export default function Sidenav() {
    return (

        <div className="sidenav">
            <div className="logo">
                <h2>Sway</h2>
            </div>
            <div className="nav-links">
                <NavLink to="/" className="nav-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12H15V22" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Home</NavLink>
                <NavLink to="/settings" className="nav-link"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg> Settings</NavLink>
                <NavLink to="/playlists" className="nav-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 18H21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6H3.01" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 18H3.01" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12H3.01" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Playlists</NavLink>
                <NavLink to="/songs" className="nav-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18V5L21 3V16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 19C19.6569 19 21 17.6569 21 16C21 14.3431 19.6569 13 18 13C16.3431 13 15 14.3431 15 16C15 17.6569 16.3431 19 18 19Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Songs</NavLink>
                 <NavLink to="/add-song" className="nav-link"> Add Song</NavLink>
                
            </div>

        </div>
    );
}
