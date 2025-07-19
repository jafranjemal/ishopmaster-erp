import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from 'ui-library';

class WizardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Wizard Error:', error, errorInfo);
    // Log to error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg'>
          <AlertCircle className='w-16 h-16 text-red-500 mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Navigation Failed</h2>
          <p className='text-gray-600 text-center mb-4'>
            The wizard encountered an unexpected error. Please restart the process.
          </p>
          <p className='text-sm text-gray-500 mb-6'>{this.state.error?.message || 'Unknown error occurred'}</p>
          <Button onClick={this.handleReset} variant='destructive'>
            Restart Selection
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WizardErrorBoundary;
