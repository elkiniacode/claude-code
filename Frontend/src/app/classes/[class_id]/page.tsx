import { Class } from "@/types";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";
import Link from "next/link";
import styles from "./page.module.scss";

interface ClassPageProps {
  params: Promise<{ class_id: string }>;
}

async function getClassData(class_id: string): Promise<Class> {
  const res = await fetch(`http://localhost:8000/classes/${class_id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar la clase");
  return res.json();
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { class_id } = await params;
  const classData = await getClassData(class_id);

  // Generate back link to course if we have the course_slug
  const backLink = classData.course_slug
    ? `/course/${classData.course_slug}`
    : '/';

  return (
    <main className={styles.container}>
      <VideoPlayer src={classData.video} title={classData.name} />
      <h1 className={styles.title}>{classData.name}</h1>
      <p className={styles.description}>{classData.description}</p>
      <Link href={backLink} className={styles.backButton}>
        ← Regresar al curso
      </Link>
    </main>
  );
}
