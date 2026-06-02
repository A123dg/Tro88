export function PortalPage() {
  return (
    <main className="portal-page">
      <nav className="portal-nav">
        <a className="brand" href="/">
          <span>88</span>
          <strong>Tro88</strong>
        </a>
        <div>
          <a href="/login/owner">Owner</a>
          <a href="/login/tenant">Tenant</a>
        </div>
      </nav>

      <section className="portal-hero">
        <div className="portal-hero__copy">
          <span className="portal-kicker">Quản lý nhà trọ trên một nền tảng</span>
          <h1>Tro88</h1>
          <p>
            Theo dõi nhà, phòng, hợp đồng, hóa đơn và phản ánh bảo trì trong một trải nghiệm rõ ràng cho cả chủ trọ và người thuê.
          </p>
          <div className="portal-actions">
            <a className="app-button app-button--primary" href="/login/owner">Đăng ký Owner</a>
            <a className="app-button app-button--outline" href="/login/tenant">Đăng ký Tenant</a>
          </div>
        </div>
        <div className="portal-product" aria-label="Tro88 product preview">
          <div className="portal-product__bar">
            <span />
            <span />
            <span />
          </div>
          <div className="portal-product__grid">
            <section>
              <small>Doanh thu</small>
              <strong>48.500.000đ</strong>
              <div className="portal-chart">
                <span style={{ height: '44%' }} />
                <span style={{ height: '68%' }} />
                <span style={{ height: '52%' }} />
                <span style={{ height: '86%' }} />
                <span style={{ height: '72%' }} />
              </div>
            </section>
            <section>
              <small>Phòng đang thuê</small>
              <strong>32/40</strong>
              <div className="portal-progress"><span /></div>
            </section>
            <section>
              <small>Bảo trì</small>
              <strong>5 phản ánh</strong>
              <ul>
                <li>Máy lạnh phòng 203</li>
                <li>Rò nước phòng 101</li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      <section className="portal-feature-strip">
        <article>
          <strong>Owner</strong>
          <p>Duyệt nhà, quản lý phòng, hóa đơn và vận hành.</p>
        </article>
        <article>
          <strong>Tenant</strong>
          <p>Xem hóa đơn, dịch vụ và gửi phản ánh bảo trì.</p>
        </article>
        <article>
          <strong>Admin</strong>
          <p>Kiểm soát tài khoản, duyệt nhà trọ và nhật ký hệ thống.</p>
        </article>
      </section>
    </main>
  )
}
