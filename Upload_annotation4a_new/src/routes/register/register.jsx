import React, { useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values) => {
    setLoading(true);
    console.log("Success:", values);
    try {
      //Create user
      const res = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: values.email,
      });
      navigate("/home");
    } catch (err) {
      setLoading(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div className="bg">
      <div className="login_card">
        <div className="form-content">
          <Form
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "Email",
                  message: "Please correct your Email format",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Type your password here",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 12,
              }}
            >
              <a style={{ color: "#8C8D9B" }} href="/">
                Login
              </a>
            </Form.Item>
            <div className="action-content">
              <div>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                  </Button>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
