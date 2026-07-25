import { Admin } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

function TestApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test App</h1>
      <p>If you see this, React is working!</p>
    </div>
  );
}

export default TestApp;
