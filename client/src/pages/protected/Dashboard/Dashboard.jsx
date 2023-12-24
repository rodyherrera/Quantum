import React from 'react';
import Input from '@components/general/Input';
import Button from '@components/general/Button';
import Project from '@components/dashboard/Project';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <main id='Dashboard-Main'>
            <section id='Dashboard-Header-Container'>
                <article id='Dashboard-Input-Container'>
                    <Input  type='text' placeholder='Search' />
                </article>
                <Button title='Create new' />
            </section>

            <section id='Dashboard-Body-Container'>
                <article id='Dashboard-Projects-Container'>
                    <Project
                        title='Quantum'
                        url='quantum-cloud.codewithrodi.com'
                        commitMessage='lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                        lastUpdate='2'
                        branch='master'
                    />
                    <Project
                        title='Quantum'
                        url='quantum-cloud.codewithrodi.com'
                        commitMessage='lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                        lastUpdate='2'
                        branch='master'
                    />
                </article>
            </section>
        </main>
    );
};

export default Dashboard;