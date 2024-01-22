import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {

    return (
        <main id='Privacy-Policy-Main'>
            <section id='Privacy-Policy-Header-Container'>
                <article id='Privacy-Policy-Title-Container'>
                    <h1 id='Privacy-Policy-Title'>Privacy Policy</h1>
                </article>
            </section>

            <section id='Privacy-Policy-Body-Container'>
                <article className='Privacy-Policy-Section-Container'>
                    <div className='Privacy-Policy-Section-Title-Container'>
                        <h3 className='Privacy-Policy-Section-Title'>Information We Collect Directly From You</h3>
                    </div>
                    
                    <div className='Privacy-Policy-Articles-Container'>
                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>You can generally visit our Site without having to submit any personal information. If you request more information, or sign up for our Services, we will collect personal information as follows.</p>
                        </div>

                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>
                                <b className='Privacy-Policy-Article-Title'>Account Information:</b>
                                <span className='Privacy-Policy-Article-Content'>When you register for a Quantum customer account, we ask for your email address. Once our systems have confirmed your email and you have successfully registered, we will ask you to create a username in conjunction with your full name. This information is your "Account Information" for the purposes of this Privacy Policy. Account information is necessary to identify you as a Customer and allow you to access your account(s). By voluntarily providing us with such account information, you represent that you are the owner of such personal data or that you otherwise have the necessary consent to provide it to us.</span>
                            </p>
                        </div>

                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>
                                <b className='Privacy-Policy-Article-Title'>Optional Information:</b>
                                <span className='Privacy-Policy-Article-Content'>Additionally, we might request your submission of personal information when you opt to engage with the interactive features of the Platform. This includes but is not limited to participating in surveys, taking part in promotions, seeking customer support, or communicating with us through various channels. Your provision of such information in these instances is voluntary and aligns with your choice to utilize these specific functionalities.</span>
                            </p>
                        </div>
                    </div>
                </article>

                <article className='Privacy-Policy-Section-Container'>
                    <div className='Privacy-Policy-Section-Title-Container'>
                        <h3 className='Privacy-Policy-Section-Title'>Information We Collect Indirectly</h3>
                    </div>
                    
                    <div className='Privacy-Policy-Articles-Container'>
                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>Upon downloading, utilizing, or engaging with the Site, even in the absence of an account, we or our authorized third parties may automatically gather information pertaining to your interaction with the Site through your device. Some of this information is categorized as personal information. The data encompassed within "Device and Usage Information" that we collect includes:</p>
                        </div>

                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>
                                <b className='Privacy-Policy-Article-Title'>Information About your Device:</b>
                                <span className='Privacy-Policy-Article-Content'>Further insights are gathered regarding the devices and software employed to access the Site. This encompasses details such as the internet browser or mobile device you utilize, the specific website or source that led you to the Site, your IP address or device ID (or any other persistent identifier uniquely marking your computer or mobile device on the Internet), the operating system running on your computer or mobile device, the screen size of your device, and additional technical information of a similar nature. This comprehensive set of technical data aids in enhancing our understanding of your digital environment and facilitates the optimization of your experience on the Site.</span>
                            </p>
                        </div>

                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>
                                <b className='Privacy-Policy-Article-Title'>Usage Information:</b>
                                <span className='Privacy-Policy-Article-Content'>Details regarding your interactions with the Platform are collected, encompassing access dates and times, hardware and software specifics, device event details, log data, and cookie data. This comprehensive set of information enables us to comprehend the screens you view, your utilization patterns on the Platform (including any administrative or support communications with us), and various other actions performed within the Platform. Log data is automatically collected by us or our authorized third parties each time you access and utilize the Platform, regardless of whether you have established an account or logged in. This information is utilized for the administration and enhancement of Services, trend analysis, monitoring user engagement with the Platform, and compiling broad demographic information for aggregate usage assessments.</span>
                            </p>
                        </div>

                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>
                                <b className='Privacy-Policy-Article-Title'>Location Information:</b>
                                <span className='Privacy-Policy-Article-Content'>To enhance our understanding of user engagement, we leverage a third-party database to associate each IP address with its corresponding general location ("Location Information"). It's important to note that the Location Information derived from an IP address is limited to country and city, and we do not pinpoint precise locations. This geographical insight is instrumental in optimizing the delivery of our Services to our Customers. Moreover, as an integral part of our Services, we share Location Information, derived from End Users' IP addresses, with our Customers. This collaboration enables our Customers to enhance the provision of their products and services by gaining a better understanding of the geographical distribution of their End Users. The shared Location Information empowers both us and our Customers to refine and tailor our offerings to better meet the needs of the diverse user base.</span>
                            </p>
                        </div>
                    </div>
                </article>

                <article className='Privacy-Policy-Section-Container'>
                    <div className='Privacy-Policy-Section-Title-Container'>
                        <h3 className='Privacy-Policy-Section-Title'>Access and Accuracy</h3>
                    </div>
                    
                    <div className='Privacy-Policy-Articles-Container'>
                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>Quantum is committed to maintaining the accuracy of your personal information and employs reasonable efforts to achieve this. As part of our commitment to transparency and control, we offer you online access to your personal information. This access enables you to conveniently review, update, or correct any personal information that we have in our records. We believe that providing you with this accessibility empowers you to ensure the accuracy and relevance of the information we hold, allowing you to have greater control over your personal data and its integrity within our system.</p>
                        </div>
                    </div>
                </article>

                <article className='Privacy-Policy-Section-Container'>
                    <div className='Privacy-Policy-Section-Title-Container'>
                        <h3 className='Privacy-Policy-Section-Title'>Anonymization</h3>
                    </div>
                    
                    <div className='Privacy-Policy-Articles-Container'>
                        <div className='Privacy-Policy-Article-Container'>
                            <p className='Privacy-Policy-Article'>In certain cases, we may opt to anonymize your personal data rather than deleting it, especially when considering its potential utility for statistical purposes. When we decide to anonymize data, we take meticulous measures to ensure that there is no conceivable way to link the anonymized information back to you or any specific user. This approach not only serves statistical analysis but also upholds our commitment to privacy by eliminating any identifiable associations. By anonymizing data responsibly, we strike a balance between preserving the integrity of our statistical insights and safeguarding the anonymity and privacy of individual users.</p>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    );
};

export default PrivacyPolicy;