// pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  notification,
  Spin,
  Alert,
} from 'antd';

const { TabPane } = Tabs;

const AuthPage = ({ setAuth }) => {
  console.log('AuthPage component rendered');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('kasha');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setAuth(parsed);
      navigate('/home');
    }
  }, [setAuth, navigate]);

  const saveToLocalStorage = (data) => {
    localStorage.setItem('kasha', JSON.stringify(data));
    setAuth(data);
  };

  const onFinishSignup = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/staff/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');

      saveToLocalStorage({
        userId: data.userId,
        username: data.username,
        email: data.email,
        token: data.token,
      });

      notification.success({ message: 'Signup successful!' });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishLogin = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/staff/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      saveToLocalStorage({
        userId: data.userId,
        username: data.username,
        email: data.email,
        token: data.token,
      });

      notification.success({ message: 'Login successful!' });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '4rem 1rem' }}>
      <Card title="Kasha Staff Portal" bordered={false}>
        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Tabs defaultActiveKey="signup">
          <TabPane tab="Sign Up" key="signup">
            <Form layout="vertical" onFinish={onFinishSignup}>
              <Form.Item
                name="username"
                label="UserName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={loading}
                >
                  {loading ? <Spin size="small" /> : 'Sign Up'}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Sign In" key="signin">
            <Form layout="vertical" onFinish={onFinishLogin}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={loading}
                >
                  {loading ? <Spin size="small" /> : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
