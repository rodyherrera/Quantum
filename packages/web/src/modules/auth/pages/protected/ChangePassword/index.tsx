import { useState } from 'react';
import { Button } from '@heroui/react';
import typia from 'typia';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import SettingsSection, { SettingsBlock } from '@/shared/components/SettingsSection';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import { useForm } from '@/shared/hooks/forms/use-form';
import { authApi } from '@/modules/auth/api/api';
import { authErrorMessages } from '@/modules/auth/utils/error-messages';
import { SETTINGS_TRAIL } from '@/modules/organization/utils/settings-trail';
import { useSessionStore } from '@/shared/store/session';
import type { AuthSubmitErrorCode } from '@/modules/auth/utils/error-messages';
import type { UpdatePasswordInput } from '@quantum/contracts/modules/auth/http';

const changePasswordErrorFields: Partial<Record<AuthSubmitErrorCode, keyof UpdatePasswordInput>> = {
    'Authentication::PasswordConfirmMismatch': 'passwordConfirm'
};

const ChangePassword = () => {
    const [saved, setSaved] = useState(false);
    const setToken = useSessionStore((state) => state.setToken);

    const form = useForm<UpdatePasswordInput>({
        validate: typia.createValidate<UpdatePasswordInput>(),
        submitErrorMessages: authErrorMessages,
        submitErrorFields: changePasswordErrorFields,
        initialValues: { passwordCurrent: '', password: '', passwordConfirm: '' },
        onSubmit: async (values) => {
            const session = await authApi.updatePassword({ body: values });
            setToken(session.token);
            form.reset();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    });

    return (
        <>
            <PageBar title='Password' trail={SETTINGS_TRAIL} />

            <PageBody variant='narrow'>
                <div className='flex flex-col gap-8'>
                    <PageIntro title='Password' description='Pick a new password. You need the current one to do it.' />

                    <SettingsSection title='Change password'>
                        <SettingsBlock>
                            <Form form={form} className='flex flex-col gap-3.5'>
                                <Field
                                    form={form}
                                    name='passwordCurrent'
                                    label='Current password'
                                    type='password'
                                    autoComplete='current-password'
                                />

                                <Field
                                    form={form}
                                    name='password'
                                    label='New password'
                                    type='password'
                                    autoComplete='new-password'
                                />

                                <Field
                                    form={form}
                                    name='passwordConfirm'
                                    label='Confirm new password'
                                    type='password'
                                    autoComplete='new-password'
                                />

                                <div className='flex items-center justify-end gap-3'>
                                    {saved && (
                                        <span className='text-xs text-success'>Password updated.</span>
                                    )}
                                    <Button type='submit' isPending={form.submitting} isDisabled={!form.isValid}>
                                        Update password
                                    </Button>
                                </div>
                            </Form>
                        </SettingsBlock>
                    </SettingsSection>
                </div>
            </PageBody>
        </>
    );
};

export default ChangePassword;
