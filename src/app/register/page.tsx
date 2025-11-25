"use client";

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Formik } from 'formik';
import * as Yup from 'yup';
import location from '../../../location.json';
import { supabase } from '../../../utils/supabase';
import './register.css';
import Reveal from '@/components/Reveal';


const registrationopen = true; 
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const SUPPORTED_PAYMENT_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];
const FILE_SIZE_8MB = 8 * 1024 * 1024; // 8MB

// Validation Schema using Yup
const RegistrationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Full name is required'),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ).required('Email is required'),
  whatsappNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be at least 10 digits')
    .max(15, 'Must be at most 15 digits')
    .required('WhatsApp number is required'),
  instagram: Yup.string().required('Instagram handle is required'),
  tiktok: Yup.string().required('Tiktok handle is required'),
  facebook: Yup.string().required('Facebook name is required'),
  age: Yup.string().required('Age is required'),
  height: Yup.string().required('Height is required'),

  winnerResponse: Yup.string()
    .min(20, 'Response must be at least 20 characters')
    .required('This field is required'),
  state: Yup.string().required('State of Origin is required'),
  dob: Yup.string()
    .required('Date of birth is required')
    .test('is-valid-date', 'Please select a valid and complete date', (value: any) => {
      if (!value) return true; // handled by 'required'
      const date = new Date(value);
      // This check handles both incomplete dates (e.g., '2024-12-') and invalid dates (e.g., '2024-02-30')
      return date instanceof Date && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }),
    
  address: Yup.string().required('Address is required'),
  lga: Yup.string().required('local government is required'),
  student: Yup.string(),
  health: Yup.string(),
  addedinfo: Yup.string().required('This field is required'),
  portrait: Yup.mixed()
    .required('A portrait is required')
    .test(
      'fileSize',
      'File too large, max 8MB',
      (value: any) => value && (value as any).size <= FILE_SIZE_8MB
    )
    .test(
      'fileFormat',
      'Unsupported format. Use JPG, JPEG, or PNG.',
      (value: any) => value && SUPPORTED_IMAGE_FORMATS.includes((value as any).type)
    ),
  paymentProof: Yup.mixed()
    .required('Proof of payment is required')
    .test(
      'fileSize',
      'File too large, max 8MB',
      (value: any) => value && (value as any).size <= FILE_SIZE_8MB
    )
    .test('fileFormat', 'Unsupported format. Use JPG, JPEG, PNG, or PDF.', (value: any) =>
      value && SUPPORTED_PAYMENT_FORMATS.includes((value as any).type)
    ),
});


interface RegistrationFormFieldsProps {
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  handleBlur: (e: React.FocusEvent<any>) => void;
  handleSubmit: () => void;
  values: any;
  errors: any;
  touched: any;
  isSubmitting: boolean;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  lgas: string[];
  handleStateChange: (state: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => void;
}

const RegistrationFormFields: React.FC<RegistrationFormFieldsProps> = ({
  handleChange,
  handleBlur,
  handleSubmit,
  values,
  errors,
  touched,
  isSubmitting,
  setFieldValue,
  lgas,
  handleStateChange,
}) => {
  const dobParts = (values.dob || '--').split('-');
  const year = dobParts[0] || '';
  const month = dobParts[1] || '';
  const day = dobParts[2] || '';

  return (
    <div className="form">
      <div className="inputGroup">
        <label className="label">Full Name</label>
        <input
          name="fullName"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.fullName}
          placeholder="full name"
        />
        {errors.fullName && touched.fullName ? (
          <div className="errorText">{errors.fullName}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Email Address</label>
        <input
          name="email"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.email}
          placeholder="email address"
          type="email"
        />
        {errors.email && touched.email ? (
          <div className="errorText">{errors.email}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">WhatsApp Number</label>
        <input
          name="whatsappNumber"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.whatsappNumber}
          placeholder="whatsapp number"
        />
        {errors.whatsappNumber && touched.whatsappNumber ? (
          <div className="errorText">{errors.whatsappNumber}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Instagram Handle</label>
        <input
          name="instagram"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.instagram}
          placeholder="your instagram handle"
        />
        {errors.instagram && touched.instagram ? (
          <div className="errorText">{errors.instagram}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Tiktok Handle</label>
        <input
          name="tiktok"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.tiktok}
          placeholder="your tiktok handle"
        />
        {errors.tiktok && touched.tiktok ? (
          <div className="errorText">{errors.tiktok}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Facebook Name</label>
        <input
          name="facebook"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.facebook}
          placeholder="your facebook name"
        />
        {errors.facebook && touched.facebook ? (
          <div className="errorText">{errors.facebook}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Address</label>
        <input
          name="address"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.address}
          placeholder="your home address"
        />
        {errors.address && touched.address ? (
          <div className="errorText">{errors.address}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Date of birth</label>
        <div className="datePickerWebContainer">
          <select
            className="webDateSelect"
            value={day}
            onChange={(e) => {
              setFieldValue('dob', `${year}-${month}-${e.target.value}`);
            }}
            onBlur={() => handleBlur({ target: { name: 'dob' } } as any)}
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="webDateSelect"
            value={month}
            onChange={(e) => {
              setFieldValue('dob', `${year}-${e.target.value}-${day}`);
            }}
            onBlur={() => handleBlur({ target: { name: 'dob' } } as any)}
          >
            <option value="">Month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            className="webDateSelect"
            value={year}
            onChange={(e) => {
              setFieldValue('dob', `${e.target.value}-${month}-${day}`);
            }}
            onBlur={() => handleBlur({ target: { name: 'dob' } } as any)}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {errors.dob && touched.dob ? <div className="errorText">{errors.dob}</div> : null}
      </div>

      <div className="inputGroup">
        <label className="label">Age</label>
        <input
          name="age"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.age}
          placeholder="Age"
        />
        {errors.age && touched.age ? (
          <div className="errorText">{errors.age}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Height in ft.</label>
        <input
          name="height"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.height}
          placeholder="your height in ft."
        />
        {errors.height && touched.height ? (
          <div className="errorText">{errors.height}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">State of Origin</label>
        <select
          className="webSelect"
          value={values.state}
          onChange={(e) => handleStateChange(e.target.value, setFieldValue)}
          onBlur={() => handleBlur({ target: { name: 'state' } } as any)}
        >
          <option value="" disabled>
            Select your state...
          </option>
          {location.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state}
            </option>
          ))}
        </select>
        {errors.state && touched.state ? <div className="errorText">{errors.state}</div> : null}
      </div>

      <div className="inputGroup">
        <label className="label">LGA</label>
        <select
          className="webSelect"
          value={values.lga}
          onChange={(e) => setFieldValue('lga', e.target.value)}
          disabled={!values.state || lgas.length === 0}
          onBlur={() => handleBlur({ target: { name: 'lga' } } as any)}
        >
          <option value="" disabled>
            Select your LGA...
          </option>
          {lgas.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
        {errors.lga && touched.lga ? <div className="errorText">{errors.lga}</div> : null}
      </div>

      <div className="inputGroup">
        <label className="label">Are you a student?</label>
        <input
          name="student"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.student}
          placeholder="if no you can leave it blank"
        />
      </div>

      <div className="inputGroup">
        <label className="label">Any health challenges?</label>
        <input
          name="health"
          className="input"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.health}
          placeholder="if no you can leave it blank"
        />
      </div>

      <div className="inputGroup">
        <label className="label">If crowned winner, what are your plans for the reign?</label>
        <textarea
          name="winnerResponse"
          className="input multilineInput"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.winnerResponse}
          placeholder="Share your vision and plans..."
          rows={4}
        />
        {errors.winnerResponse && touched.winnerResponse ? (
          <div className="errorText">{errors.winnerResponse}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">What else do you want the organization to know about you?</label>
        <textarea
          name="addedinfo"
          className="input multilineInput"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.addedinfo}
          placeholder="Additional information about yourself..."
          rows={4}
        />
        {errors.addedinfo && touched.addedinfo ? (
          <div className="errorText">{errors.addedinfo}</div>
        ) : null}
      </div>

      <div className="inputGroup">
        <label className="label">Upload a professional portrait of yourself (8mb max)</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.currentTarget.files && event.currentTarget.files[0]) {
              setFieldValue('portrait', event.currentTarget.files[0]);
            }
          }}
          className="webFileInput"
        />
        {values.portrait && <div className="fileName">{values.portrait.name}</div>}
        {errors.portrait && touched.portrait ? (
          <div className="errorText">{errors.portrait}</div>
        ) : null}
      </div>

      <div className="paymentInfoContainer">
        <div className="paymentHeader">Registration fee ₦5,000</div>
        <div className="paymentText">
          Pay into the account below and upload the proof of payment before submitting your
          application
        </div>
        <div className="accountDetailsBox">
          <div className="accountDetails">OBINNA TORTY AKUMA</div>
          <div className="accountDetails">OPAY</div>
          <div className="accountDetailsBold">6142103511</div>
        </div>
      </div>

      <div className="inputGroup">
        <label className="label">UPLOAD PROOF OF PAYMENT *</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, application/pdf"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.currentTarget.files && event.currentTarget.files[0]) {
              setFieldValue('paymentProof', event.currentTarget.files[0]);
            }
          }}
          className="webFileInput"
        />
        {values.paymentProof && <div className="fileName">{values.paymentProof.name}</div>}
        {errors.paymentProof && touched.paymentProof ? (
          <div className="errorText">{errors.paymentProof}</div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className={`button ${isSubmitting ? 'buttonDisabled' : ''}`}
        disabled={isSubmitting}
      >
        <span className="buttonText">{isSubmitting ? 'Submitting...' : 'Submit Registration'}</span>
      </button>
    </div>
  );
};

const RegisterPage = () => {
  const [lgas, setLgas] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegistration = async (values: any, { setSubmitting, resetForm }: any) => {
    setSubmitting(true);
    try {
        const portraitFile = values.portrait;
        const portraitFileExt = portraitFile.name.split('.').pop();
        const generateId = () =>
          typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
            ? (crypto as any).randomUUID()
            : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
        const portraitFileName = `${generateId()}.${portraitFileExt}`;
      const portraitPath = `portraits/${portraitFileName}`;

      const paymentFile = values.paymentProof;
        const paymentFileExt = paymentFile.name.split('.').pop();
        const paymentFileName = `${generateId()}.${paymentFileExt}`;
      const paymentPath = `payment-proofs/${paymentFileName}`;

      const [portraitUploadResult, paymentUploadResult] = await Promise.all([
        supabase.storage.from('portraits').upload(portraitPath, portraitFile),
        supabase.storage.from('payment-proofs').upload(paymentPath, paymentFile),
      ]);

      if (portraitUploadResult.error) throw portraitUploadResult.error;
      if (paymentUploadResult.error) throw paymentUploadResult.error;

      const {
        data: { publicUrl: portraitUrl },
      } = supabase.storage.from('portraits').getPublicUrl(portraitPath) as any;
      const {
        data: { publicUrl: paymentProofUrl },
      } = supabase.storage.from('payment-proofs').getPublicUrl(paymentPath) as any;

      const { portrait, paymentProof, ...restOfValues } = values;
      const submissionData = {
        ...restOfValues,
        portrait_url: portraitUrl,
        payment_proof_url: paymentProofUrl,
        event_year: 2025,
      };

      const { data, error: dbError } = await supabase.from('treat_register').insert([submissionData]);

      if (dbError) throw dbError;

      console.log('Registration successful:', data);
      resetForm();
      setLgas([]);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      window.alert(`There was an error submitting your registration: ${error?.message || error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStateChange = (state: string, setFieldValue: any) => {
    const selectedStateData = location.find((item) => item.state === state);
    const stateLgas = selectedStateData ? selectedStateData.lgas : [];
    setLgas(stateLgas);
    setFieldValue('state', state);
    setFieldValue('lga', '');
  };

  return (
    <div className="safeArea">
      <Reveal>

      <div className="scrollContainer">
        {registrationopen ? (
          <>
            <h1 className="title">Register for the Pageant</h1>
            <p className="subtitle">Fill in the details below to start your journey.</p>
            <p className="subtitle">Please Fill Out Each Question Carefully And Completely In English Language. It Is In Your Best Interest To Be Truthful.</p>

            <Formik
              initialValues={{
                fullName: '',
                email: '',
                whatsappNumber: '',
                winnerResponse: '',
                lga: '',
                dob: '',
                health: '',
                state: '',
                address: '',
                student: '',
                addedinfo: '',
                instagram: '',
                tiktok: '',
                facebook: '',
                age: '',
                height: '',
                portrait: null as File | null,
                paymentProof: null as File | null,
              }}
              validationSchema={RegistrationSchema}
              onSubmit={handleRegistration}
            >
              {(formikProps) => (
                <RegistrationFormFields
                  {...formikProps}
                  lgas={lgas}
                  handleStateChange={handleStateChange}
                />
              )}
            </Formik>

            {isSuccess && (
              <div className="successBanner">
                <div className="successText">Registration successful! We will get in touch with you soon.</div>
              </div>
            )}
            </>
        ) : (
          <div className="registrationClosed">
            <div className="registrationClosedBox">
              <h2 className="closedTitle">Registration Closed</h2>
              <p className="closedText">Registration is currently closed. Please check back later.</p>
            </div>
          </div>
        )}
      </div>
  
        </Reveal>
    </div>
  );
};

export default RegisterPage;
