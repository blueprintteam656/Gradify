import { useRef } from 'react';
import { GraduationCap, IdCard } from 'lucide-react';

import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import academicData from '../../../../mocks/data/academic.json';

const ROLE_OPTIONS = [
  { value: 'student', title: 'Student', description: 'I am working on my graduation project.', Icon: GraduationCap },
  { value: 'supervisor', title: 'Supervisor', description: 'I am mentoring student teams.', Icon: IdCard },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = String(CURRENT_YEAR + i);
  return { value: year, label: year };
});

const toOptions = (items = []) => items.map((item) => ({ value: item.id, label: item.name }));

function RoleRadioGroup({ value, onChange, error }) {
  const refs = useRef([]);

  const handleKeyDown = (e, index) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (index + step + ROLE_OPTIONS.length) % ROLE_OPTIONS.length;
    onChange(ROLE_OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <span id="role-label" className="text-sm font-semibold text-gray-900">
        I am joining as a:
      </span>
      <div
        role="radiogroup"
        aria-labelledby="role-label"
        aria-describedby={error ? 'role-error' : undefined}
        className="grid grid-cols-2 gap-4"
      >
        {ROLE_OPTIONS.map(({ value: optionValue, title, description, Icon }, index) => {
          const selected = value === optionValue;
          return (
            <button
              key={optionValue}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(optionValue)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex cursor-pointer flex-col items-start gap-2 rounded-lg bg-white text-left transition focus-visible:ring-2 focus-visible:ring-step-active/40 focus-visible:ring-offset-2 focus-visible:outline-none ${
                selected
                  ? 'border-2 border-step-active p-[15px]'
                  : 'border border-border-subtle p-4 hover:border-gray-300'
              }`}
            >
              <Icon size={20} aria-hidden="true" className={selected ? 'text-step-active' : 'text-gray-400'} />
              <span className="text-sm font-bold text-gray-900">{title}</span>
              <span className="text-xs text-gray-600">{description}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p id="role-error" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AcademicStep({ form, errors, onFieldChange }) {
  const handleChange = (e) => onFieldChange(e.target.name, e.target.value);

  const university = academicData.universities.find((u) => u.id === form.university);
  const faculty = university?.faculties.find((f) => f.id === form.faculty);

  return (
    <>
      <RoleRadioGroup value={form.role} onChange={(role) => onFieldChange('role', role)} error={errors.role} />

      <Select
        size="md"
        label="University"
        name="university"
        value={form.university}
        onChange={handleChange}
        options={toOptions(academicData.universities)}
        error={errors.university}
      />

      <div className="grid grid-cols-1 items-start gap-[23px] sm:grid-cols-2 sm:gap-4">
        <Select
          size="md"
          label="Faculty"
          name="faculty"
          value={form.faculty}
          onChange={handleChange}
          placeholder="Select Faculty"
          options={toOptions(university?.faculties)}
          error={errors.faculty}
        />
        <Select
          size="md"
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Select Department"
          options={toOptions(faculty?.departments)}
          disabled={!faculty}
          error={errors.department}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-[23px] sm:grid-cols-2 sm:gap-4">
        <Input
          size="md"
          label="Academic ID"
          name="academicId"
          value={form.academicId}
          onChange={handleChange}
          placeholder="e.g., 202012345"
          inputMode="numeric"
          error={errors.academicId}
        />
        <Select
          size="md"
          label="Graduation Year"
          name="graduationYear"
          value={form.graduationYear}
          onChange={handleChange}
          placeholder="Select Year"
          options={GRADUATION_YEARS}
          error={errors.graduationYear}
        />
      </div>
    </>
  );
}
