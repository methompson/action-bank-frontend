export default function Footer() {
  const now = new Date();
  return <footer className="footer">Copyright {now.getFullYear()}</footer>;
}