import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegisterUser, clearError } from "../store/authReducer";
import { Button, Form, Input, Breadcrumb } from "antd";
import { Link } from "react-router-dom";

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: {
      xs: {
        span: 16,
      },
      sm: {
        span: 8,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 16,
      },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  const registerError = useSelector((state) => state.auth.error);

  const [formValid, setFormValid] = useState(false);

  const [registerUser, setRegisterUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [inputDirty, setInputDirty] = useState({
    username: false,
    email: false,
    password: false,
  });

  const [inputError, setInputError] = useState({
    username: "The field cannot be empty",
    email: "The field cannot be empty",
    password: "The field cannot be empty",
  });

  useEffect(() => {
    if (inputError.username || inputError.email || inputError.password) {
      setFormValid(false);
    } else {
      setFormValid(true);
    }
  }, [inputError]);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setRegisterUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setInputDirty((prevState) => ({
      ...prevState,
      [name]: false,
    }));

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;

    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

    const { username, email, password } = registerUser;

    setInputError((prevState) => ({
      ...prevState,
      username:
        name === "username" && (username === "" || !usernameRegex.test(value))
          ? "Username should start with a latin letter and contain at least 4 characters"
          : "",
      email:
        name === "email" && (email === "" || !emailRegex.test(value))
          ? "Invalid email pattern"
          : "",
      password:
        name === "password" &&
        (password === "" || !passwordRegex.test(String(value)))
          ? "Password should include 1 digit, 1 capital letter, one special character, and be at least 6 characters long"
          : "",
    }));
  };

  const handleSubmit = () => {
    dispatch(fetchRegisterUser(registerUser)).then((action) => {
      const isRegisterUserFulfilled = fetchRegisterUser.fulfilled.match(action);
      if (isRegisterUserFulfilled) {
        dispatch(clearError());
        navigate(`/`);
      }
    });
  };

  return (
    <div className="registerForm shadow">
      <Breadcrumb
        className="back-to-login"
        items={[
          {
            title: <Link to={"/"}>Войти</Link>,
          },
        ]}
      />
      <Form
        {...formItemLayout}
        form={form}
        name="register"
        value={registerUser.username}
        onFinish={handleSubmit}
        scrollToFirstError
      >
        <Form.Item
          name="login"
          label="Логин"
          rules={[
            {
              required: true,
              message: "Введите ваш логин!",
              whitespace: true,
            },
          ]}
        >
          <Input name="username" onChange={(e) => changeHandler(e)} />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: "email",
              message: "Это не похоже на E-mail!",
            },
            {
              required: true,
              message: "Введите E-mail",
            },
          ]}
        >
          <Input name="email" onChange={(e) => changeHandler(e)} />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            {
              required: true,
              message: "Введите пароль!",
            },
          ]}
          hasFeedback
        >
          <Input.Password name="password" onChange={(e) => changeHandler(e)} />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Повторите пароль"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Повторите пароль!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Пароль не совпадает!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Зарегистироваться
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
