import React from 'react';
import Button from '@components/general/Button';
import { FaCheckCircle } from 'react-icons/fa';
import './ServiceStatus.css';

const ServiceStatus = () => {

    return (
        <main id='Service-Status-Main'>
            <section id='Service-Status-Header-Container'>
                <article id='Service-Status-Title-Container'>
                    <h1 id='Service-Status-Title'>System status</h1>
                </article>
            </section>

            <section id='Service-Status-Body-Container'>
                <article id='Service-Status-Container'>
                    <i id='Service-Status-Icon'>
                        <FaCheckCircle />
                    </i>
                    <h3 id='Service-Status'>All Systems Operational</h3>
                </article>

                <article id='Service-Detailed-Status-Container'>
                    <p className='Service-Detailed-Status'>Server resources are controlled below 80%. The server is working optimally for all processes.</p>
                    <p className='Service-Detailed-Status'>The ram memory is below 80% usage with respect to the total installed memory and the total available memory.</p>
                    <p className='Service-Detailed-Status'>The average processor usage considering all available threads is below 80%. The processor is not overloaded and is working optimally.</p>
                </article>
            </section>

            <section id='Service-Status-Footer-Container'>
                <Button title='Check again' />
            </section>
        </main>
    );
};

export default ServiceStatus;