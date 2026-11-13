export interface PortfolioProject {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  imageUrl: string;
  demoUrl: string;
}

export const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 'p1',
    title: 'Construction Company Landing Page',
    titleAr: 'صفحة هبوط لشركة مقاولات وإنشاءات',
    description:
      'Responsive corporate landing page for an engineering and construction firm with project showcases and service overviews.',
    descriptionAr:
      'صفحة هبوط متجاوبة لشركة مقاولات وإنشاءات مع عرض للمشاريع والخدمات الهندسية.',
    date: '2026-10',
    imageUrl:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://github.com/omaralshatti/construction-landing-page',
  },
  {
    id: 'p2',
    title: 'University LMS Learning Management System',
    titleAr: 'نظام إدارة التعلم الجامعي الإلكتروني LMS',
    description:
      'Coursework portal built for students and instructors to manage assignments, lecture materials, and grade tracking.',
    descriptionAr:
      'منصة تعليمية للطلبة والمحاضرين لإدارة الواجبات والمحاضرات ومتابعة الدرجات.',
    date: '2026-09',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://github.com/omaralshatti/university-lms-portal',
  },
  {
    id: 'p3',
    title: 'Website Figma Design System',
    titleAr: 'تصميم واجهة موقع إلكتروني عبر فيغما',
    description:
      'Component library and responsive web UI kit designed in Figma for rapid prototyping and dark-mode interfaces.',
    descriptionAr:
      'مكتبة مكونات ونظام تصميم واجهات ويب متكامل عبر فيغما للنماذج الأولية السريعة.',
    date: '2026-07',
    imageUrl:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://github.com/omaralshatti/figma-web-design-system',
  },
  {
    id: 'p4',
    title: 'Real Estate Property Portal Website',
    titleAr: 'موقع وبوابة عقارية تفاعلية للبحث عن العقارات',
    description:
      'Interactive property search website featuring filtered listings, floor plan galleries, and inquiry routing.',
    descriptionAr:
      'بوابة عقارية تفاعلية تتيح البحث وتصفية العقارات ومعاينة المخططات.',
    date: '2026-05',
    imageUrl:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://github.com/omaralshatti/real-estate-portal',
  },
  {
    id: 'p5',
    title: 'Medical Clinic Appointment Website',
    titleAr: 'موقع حجز مواعيد العيادات والمراكز الطبية',
    description:
      'Web interface for medical clinics enabling patients to browse departments, doctors, and available appointment slots.',
    descriptionAr:
      'موقع إلكتروني للعيادات يسهل استعراض التخصصات والأطباء وحجز المواعيد.',
    date: '2026-03',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://github.com/omaralshatti/clinic-appointment-site',
  },
  {
    id: 'p6',
    title: 'Modern E-Commerce Storefront Website',
    titleAr: 'موقع متجر إلكتروني متكامل وسريع',
    description:
      'Full-stack storefront web application with catalog filtering, persistent shopping cart, and bilingual RTL layout.',
    descriptionAr:
      'تطبيق متجر إلكتروني متكامل مع تصفية المنتجات وسلة مشتريات ودعم كامل للغة العربية.',
    date: '2026-01',
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://github.com/omaralshatti/ecommerce-storefront-web',
  },
];
