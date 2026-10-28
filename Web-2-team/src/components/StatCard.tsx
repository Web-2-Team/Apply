type StatCardProps = {
  label: string
  value: string
  detail: string
  tone?: 'purple' | 'orange' | 'green'
}

export function StatCard({
  label,
  value,
  detail,
  tone = 'purple',
}: StatCardProps) {
  return (
    <article className={`stat-card ${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-detail">{detail}</p>
    </article>
  )
}
