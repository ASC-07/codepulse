export default function Badge({ children, variant = 'purple' }) {
  const variants = {
    purple: 'bg-[#7F77DD]/15 text-[#afa9ec]',
    green:  'bg-[#5DCAA5]/12 text-[#5DCAA5]',
    amber:  'bg-[#FAC775]/12 text-[#FAC775]',
    red:    'bg-[#F09595]/12 text-[#F09595]',
    blue:   'bg-[#85B7EB]/12 text-[#85B7EB]',
  }
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}