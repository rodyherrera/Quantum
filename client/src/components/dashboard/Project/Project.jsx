import React from 'react';
import { IoIosMore } from 'react-icons/io';
import { FaGithub } from 'react-icons/fa';
import { IoIosGitBranch } from 'react-icons/io';
import './Project.css';

const Project = ({ title, url, commitMessage, lastUpdate, branch }) => {
    return (
        <div className='Project-Container'>
            <i className='Project-More-Icon-Container'>
                <IoIosMore />
            </i>

            <div className='Project-Header-Container'>
                <div className='Project-Image-Container'>
                    <img className='Project-Image' src='https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png' alt='Project' />
                </div>
                <div className='Project-Title-Container'>
                    <h3 className='Project-Title'>{title}</h3>
                    <p className='Project-URL'>{url}</p>
                </div>
            </div>

            <div className='Project-Body-Container'>
                <div className='Project-Description-Container'>
                    <p className='Project-Description'>{commitMessage}</p>
                </div>
            </div>

            <div className='Project-Footer-Container'>
                <p className='Project-Update-Message'>
                    <i className='Project-Github-Icon-Container'>
                        <FaGithub />
                    </i>
                    <span>{lastUpdate} day(s) ago on</span>
                    <i className='Project-Github-Icon-Container'>
                        <IoIosGitBranch />
                    </i>
                    <span>{branch}</span>
                </p>
            </div>
        </div>
    );
};

export default Project;