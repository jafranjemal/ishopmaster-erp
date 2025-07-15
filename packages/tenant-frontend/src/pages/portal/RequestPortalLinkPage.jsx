import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { portalAuthService } from '../../services/portalApi';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui-library';

const RequestPortalLinkPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(portalAuthService.requestNewLink({ email }), {
        loading: 'Requesting new link...',
        success: 'Request received!',
        error: 'An error occurred.',
      });
      setIsSubmitted(true);
    } catch (err) {
      /* handled by toast */
    }
  };

  if (isSubmitted) {
    return (
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Check Your Email</h1>
        <p className='mt-2 text-slate-400'>
          If an account with that email exists, a new secure access link has been sent to your inbox.
        </p>
      </div>
    );
  }

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Request New Access Link</CardTitle>
        <CardDescription>
          Lost your receipt? Enter your email below and we'll send you a new link to track your repairs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='email'>Your Email Address</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button type='submit' className='w-full'>
            Send New Link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default RequestPortalLinkPage;
