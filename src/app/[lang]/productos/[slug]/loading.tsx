export default function ProductLoading() {
  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:gap-16">
      <div className="skeleton aspect-4/5 w-full" />
      <div className="space-y-4 lg:py-4">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-12 w-3/4" />
        <div className="skeleton h-6 w-32" />
        <div className="skeleton mt-8 h-12 w-full" />
        <div className="skeleton h-14 w-full" />
      </div>
    </div>
  );
}
