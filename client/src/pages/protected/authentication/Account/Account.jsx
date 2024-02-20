import React from 'react';
import AnimatedMain from '@components/general/AnimatedMain';
import Breadcrumbs from '@components/general/Breadcrumbs';
import Input from '@components/general/Input';
import RelatedItems from '@components/general/RelatedItems';
import { GoGitPullRequest } from 'react-icons/go';
import { BsHddNetwork } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import './Account.css';

const AccountPage = () => {
    const { user } = useSelector((state) => state.auth);
    
    return (
        <AnimatedMain id='Account-Page-Main' className='Binary-View-Container'>
            <section className='Binary-View-Left-Container'>
                <article id='Account-Page-Header-Container'>
                    <Breadcrumbs 
                        items={[
                            { title: 'Home', to: '/' },
                            { title: 'Dashboard', to: '/dashboard/' },
                            { title: `My Account (@${user.username})` , to: '/auth/account/' }
                        ]}
                    />
                    <div id='Account-Page-Header-Title-Container'>
                        <h1 id='Account-Page-Header-Title'>
                            What would you<br/>like to do today,
                            <span id='Account-Page-Header-Title-User-First-Name'>{user.fullname.split(' ')[0]}?</span>
                        </h1>
                        <p id='Account-Page-Header-Description'>We appreciate the trust you place in us to host your applications.</p>
                    </div>
                </article>
                
                <article id='Account-Page-General-Container'>
                    <Input
                        type='text'
                        name='fullname'
                        value={user.fullname}
                        placeholder='What is your full name?'
                        helperText='We want to communicate from you to you, let us know your full name.' />
                    <Input
                        type='text'
                        name='username'
                        value={user.username}
                        placeholder='How do you like to be called?'
                        helperText='Your username is how others will identify you. Choose something memorable and unique!' />
                    <Input
                        type='email'
                        name='email'
                        value={user.email}
                        placeholder='What is your email address?'
                        helperText='Your email address will be used for communication and account verification purposes. Please provide a valid email address.' />
                </article>
            </section>

            <section className='Binary-View-Right-Container'>
                <RelatedItems
                    items={[
                        {
                            title: `${user.repositories.length} repositories`,
                            description: 'Manage all your repositories hosted within the platform.',
                            icon: GoGitPullRequest,
                            to: '/dashboard/'
                        },
                        {
                            title: `${user.deployments.length} deployments`,
                            description: 'All deployments related to the repositories that you have hosted on the platform.',
                            icon: BsHddNetwork,
                            to: '/dashboard/'
                        }
                    ]}
                />
            </section>
        </AnimatedMain>
    );
};

export default AccountPage;