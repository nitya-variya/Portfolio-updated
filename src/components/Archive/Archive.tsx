import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import './Archive.scss';

// ── Data ─────────────────────────────────────────────────────────────────────
const ARCHIVE_DATA = [
  { id: '01', client: 'Lumina Tech',  role: 'WebGL / Architecture',  year: '2025', img: 'assets/lumina-mock.jpg'   },
  { id: '02', client: 'Nexus Core',   role: 'System Automation',     year: '2024', img: 'assets/nexus-mock.jpg'    },
  { id: '03', client: 'Aura Studio',  role: 'Creative Direction',    year: '2024', img: 'assets/aura-mock.jpg'     },
  { id: '04', client: 'Vanguard',     role: 'Frontend Systems',      year: '2023', img: 'assets/vanguard-mock.jpg' },
  { id: '05', client: 'Ethereal',     role: 'Motion Design',         year: '2023', img: 'assets/ethereal-mock.jpg' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function BrutalistArchive() {
  const cursorRef  = useRef<HTMLDivElement>(null);
  const [activeImg, setActiveImg] = useState('');

  // ── Global mouse-tracking: runs once, zero cleanup overhead ──────────────
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // ── Row hover handlers ────────────────────────────────────────────────────
  const handleEnter = (img: string) => {
    setActiveImg(img);
    gsap.to(cursorRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleLeave = () => {
    gsap.to(cursorRef.current, {
      scale: 0.5,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      overwrite: 'auto',
    });
  };

  return (
    <section className="fs_archive_section" id="archive">

      {/* ── Floating magnetic image ─────────────────────────────────────────── */}
      <div className="fs_cursor_img_wrapper" ref={cursorRef} aria-hidden="true">
        {activeImg && (
          <img src={activeImg} alt="Project preview" className="fs_cursor_img" />
        )}
      </div>

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="fs_archive_header">
        <h2 className="fs_archive_title">Full Index</h2>
      </div>

      {/* ── Data table ─────────────────────────────────────────────────────── */}
      <div className="fs_archive_table" role="table" aria-label="Project archive">

        {/* Column headers */}
        <div className="fs_archive_row fs_archive_labels" role="row">
          <span className="fs_col_id"    role="columnheader">ID</span>
          <span className="fs_col_client" role="columnheader">Client</span>
          <span className="fs_col_role"  role="columnheader">Role</span>
          <span className="fs_col_year"  role="columnheader">Year</span>
        </div>

        {/* Data rows */}
        {ARCHIVE_DATA.map((item) => (
          <div
            className="fs_archive_row fs_interactive_row"
            key={item.id}
            role="row"
            onMouseEnter={() => handleEnter(item.img)}
            onMouseLeave={handleLeave}
          >
            <span className="fs_col_id"    role="cell">{item.id}</span>
            <span className="fs_col_client" role="cell">{item.client}</span>
            <span className="fs_col_role"  role="cell">{item.role}</span>
            <span className="fs_col_year"  role="cell">{item.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
