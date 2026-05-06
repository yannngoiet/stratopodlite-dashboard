'use client';

import { useRef } from 'react';
import { FormControl, FormLabel } from 'react-bootstrap';

interface OTPInputProps {
  code: any[]
  setCode: (code: any[]) => void
  inputClassName?: string
  label?: string
  labelClassName?: string
}

const OTPInput = ({
  code,
  setCode,
  inputClassName = '',
  label,
  labelClassName = ''
}: OTPInputProps) => {
  const inputsRef = useRef<any[]>([]);

  const handleChange = (e: React.ChangeEvent<any>, idx: number) => {

    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    if (value && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

 const handleKeyDown = (e: React.KeyboardEvent<any>, idx: number) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return <>
      <FormLabel className={labelClassName}>
        {label} <span className="text-danger">*</span>
      </FormLabel>
      <div className="d-flex gap-2 two-factor">
        {code.map((number, idx) => <FormControl key={idx} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} className={`text-center ${inputClassName}`} value={number} onChange={e => handleChange(e, idx)} onKeyDown={e => handleKeyDown(e, idx)} ref={el => { inputsRef.current[idx] = el; }} autoComplete="one-time-code" />)}
      </div>
    </>;
};

export default OTPInput;