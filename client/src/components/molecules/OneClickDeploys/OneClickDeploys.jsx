import React from 'react';
import { TfiWorld } from "react-icons/tfi";
import { BsArrowRight } from 'react-icons/bs';
import './OneClickDeploys.css';

const OneClickDeploys = () => {
    
    return (
        <div className='One-Click-Deploys-Container'>
            {[
                ['Supabase', 'An open source Firebase alternative. Build in a weekend Scale to millions', 'https://supabase.com/'],
                ['Coder', 'Deploy development environments on your infrastructure.', 'https://coder.com/'],
                ['Wordpress', 'Everything you need to build and grow any website—all in one place.', 'https://wordpress.com/'],
                ['NGINX', 'An open source reverse proxy server for HTTP, HTTPS, SMTP, POP3, and IMAP protocols.', 'https://nginx.org/en/'],
                ['Ubuntu', 'The modern, open source operating system on Linux for the enterprise server, desktop, cloud, and IoT.', 'https://ubuntu.com/'],
                ['Alpine Linux', 'A security-oriented, lightweight Linux distribution based on musl libc and busybox.', 'https://alpinelinux.org/'],
                ['Kali Linux', 'Penetration Testing and Ethical Hacking Linux Distribution.', 'https://www.kali.org/'],
                ['Mongo', 'Built by developers, for developers. The document data model maps to how you think and code.', 'https://www.mongodb.com/'],
                ['PostgreSQL', "The World's Most Advanced Open Source Relational Database", 'https://www.postgresql.org/'],
                ['Redis', 'Your app is about to get faster. The real time data platform.', 'https://redis.io/'],
                ['MySQL Server', "The world's most popular open source database", 'https://www.mysql.com/']
            ].map(([ title, description, website ], index) => (
                <div className='One-Click-Deploy-Container' key={index}>
                    <div className='One-Click-Deploy-Header-Container'>
                        <h3 className='One-Click-Deploy-Title'>{title}</h3>
                        <i className='One-Click-Deploy-Service-URL' onClick={() => window.open(website, '_blank')}>
                            <TfiWorld />
                        </i>
                    </div>
                    <div className='One-Click-Deploy-Footer-Container'>
                        <p className='One-Click-Deploy-Description'>{description}</p>
                        <i className='One-Click-Deploy-Arrow-Container'>
                            <BsArrowRight />
                        </i>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OneClickDeploys;