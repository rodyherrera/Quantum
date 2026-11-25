import { Button } from '@heroui/react';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import AuthShell from '@/modules/auth/components/AuthShell';
import Reveal from '@/modules/auth/components/Reveal';
import { useIdentifierFlow } from '@/modules/auth/hooks/use-identifier-flow';
import type { IdentifierStep } from '@/modules/auth/hooks/use-identifier-flow';

const TITLE: Record<IdentifierStep, string> = {
    email: 'Sign in to Quantum',
    password: 'Sign in to Quantum',
    signup: 'Create your account'
};

const SUBMIT_LABEL: Record<IdentifierStep, string> = {
    email: 'Continue',
    password: 'Sign in',
    signup: 'Create account'
};

const SignIn = () => {
    const { step, form, back } = useIdentifierFlow();

    return (
        <AuthShell
            title={TITLE[step]}
            description={step === 'signup' ? 'There is no account for this email yet.' : undefined}
        >
            <Form form={form} className='flex flex-col [&_.input]:h-9 [&_.label]:sr-only'>
                <Field form={form} name='email' label='Email' type='email' placeholder='Email' autoComplete='email' />

                <Reveal show={step === 'signup'}>
                    <Field form={form} name='fullname' label='Full name' placeholder='Full name' autoComplete='name' />
                    <Field form={form} name='username' label='Username' placeholder='Username' autoComplete='username' />
                </Reveal>

                <Reveal show={step !== 'email'}>
                    <Field
                        form={form}
                        name='password'
                        label='Password'
                        type='password'
                        placeholder='Password'
                        autoComplete={step === 'signup' ? 'new-password' : 'current-password'}
                    />
                </Reveal>

                <Reveal show={step === 'signup'}>
                    <Field
                        form={form}
                        name='passwordConfirm'
                        label='Confirm password'
                        type='password'
                        placeholder='Confirm password'
                        autoComplete='new-password'
                    />
                </Reveal>

                <Button type='submit' size='lg' fullWidth isPending={form.submitting} className='mb-1 mt-3'>
                    {SUBMIT_LABEL[step]}
                </Button>
            </Form>

            <p className='text-center text-xs text-subtle'>
                {step === 'email' ? 'No account yet? Enter your email to create one.' : (
                    <>
                        {step === 'signup' ? 'Already have an account? ' : 'Not your account? '}
                        <button
                            type='button'
                            onClick={back}
                            className='rounded font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                        >
                            Use another email
                        </button>
                    </>
                )}
            </p>
        </AuthShell>
    );
};

export default SignIn;
