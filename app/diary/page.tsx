import TodayRecordForm from "../components/TodayRecordForm";

export default async function DiaryPage() {
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <TodayRecordForm />
    </main>
  );
}
