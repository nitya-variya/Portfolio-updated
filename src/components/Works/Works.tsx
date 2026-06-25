import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Works.scss';

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  { id: 1, title: "Canadian Food Exporters Association", type: "Multilingual Architecture", img: "assets/cfea-mock.jpg" },
  { id: 2, title: "Global Soccer Development", type: "Digital Transformation & Automation", img: "assets/gsd-mock.jpg" },
  { id: 3, title: "Quick Deli Style", type: "Frontend & Custom Ordering Systems", img: "assets/quickdeli-mock.jpg" },
  { id: 4, title: "GlamAI", type: "Interactive Promotional Production", img: "assets/glamai-mock.jpg" }
];

export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Calculate total scroll distance
    const scrollWidth = track.scrollWidth - window.innerWidth;

    // The Main Horizontal Scroll
    gsap.to(track, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        end: () => "+=" + track.scrollWidth,
      }
    });

    // The Image Parallax (The Magic)
    const images = gsap.utils.toArray<HTMLImageElement>('.fs_project_img');
    images.forEach((img) => {
      gsap.fromTo(img,
        { x: "-15%" },
        {
          x: "15%",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scrub: 1,
            start: "top top",
            end: () => "+=" + track.scrollWidth,
          }
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section className="fs_works_section" ref={sectionRef}>
      <div className="fs_works_track" ref={trackRef}>
        {PROJECTS.map((project) => (
          <div className="fs_project_card" key={project.id}>
            <div className="fs_project_img_wrapper">
              <img src={project.img} alt={project.title} className="fs_project_img" />
            </div>
            <div className="fs_project_info">
              <h3 className="fs_project_title">{project.title}</h3>
              <span className="fs_project_type">{project.type}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
