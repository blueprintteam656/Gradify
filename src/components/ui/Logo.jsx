import logo from '../../assets/brand/gradify-logo.png';

const SIZES = {
  sm: 'h-10',
  md: 'h-20',
};

export default function Logo({ size = 'md', className = '' }) {
  return <img src={logo} alt="Gradify" className={`w-auto ${SIZES[size] ?? SIZES.md} ${className}`} />;
}
