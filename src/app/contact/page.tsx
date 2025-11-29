'use client';

import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../../api/utils/supabase';
import styles from '../styles/contact.module.css';
import Reveal from '@/components/Reveal';

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short!')
    .max(50, 'Name is too long!')
    .required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailClick = () => {
    window.location.href = 'mailto:movietreatpodcast@gmail.com';
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/2348136398336', '_blank');
  };

  const handleFormSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('message').insert([
        {
          name: values.name,
          email: values.email,
          message: values.message,
          status: 'unread',
        },
      ]);

      if (error) throw error;

      resetForm();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (error) {
      console.error('Error submitting message:', error);
      alert(`There was an error sending your message. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <Reveal>
    <main className={styles.container}>

      <h1 className={styles.title}>Contact Us</h1>
      <p className={styles.subtitle}>
        Have a question, feedback, or a suggestion? We'd love to hear from you.
      </p>

      <div className={styles.contactInfoContainer}>
        <div className={styles.contactItem}>
          <h3 className={styles.contactLabel}>Email Us</h3>
          <button 
            onClick={handleEmailClick}
            className={styles.contactValue}
          >
            movietreatpodcast@gmail.com
          </button>
        </div>
        <div className={styles.contactItem}>
          <h3 className={styles.contactLabel}>WhatsApp</h3>
          <button 
            onClick={handleWhatsAppClick}
            className={styles.contactValue}
          >
            +234 813 639 8336
          </button>
        </div>
      </div>

      <div className={styles.separator} />

      <h2 className={styles.formTitle}>Send Us a Message</h2>

      <Formik
        initialValues={{ name: '', email: '', message: '' }}
        validationSchema={ContactSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit as any} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Name</label>
              <input
                type="text"
                className={styles.input}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                placeholder="Enter your name"
                />
              {errors.name && touched.name ? (
                <span className={styles.errorText}>{errors.name}</span>
              ) : null}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Email</label>
              <input
                type="email"
                className={styles.input}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                placeholder="Enter your email address"
                />
              {errors.email && touched.email ? (
                <span className={styles.errorText}>{errors.email}</span>
              ) : null}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Message</label>
              <textarea
                className={`${styles.input} ${styles.multilineInput}`}
                onChange={handleChange('message')}
                onBlur={handleBlur('message')}
                value={values.message}
                placeholder="Your suggestion, feedback, or question..."
                rows={5}
                />
              {errors.message && touched.message ? (
                <span className={styles.errorText}>{errors.message}</span>
              ) : null}
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting}
              >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </Formik>

      {isSuccess && (
        <div className={styles.successBanner}>
          <p className={styles.successText}>
            Message sent successfully! We will get back to you soon.
          </p>
        </div>
      )}
    </main>
      </Reveal>
  );
}