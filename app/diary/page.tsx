import RequireLogin from "../components/RequireLogin";
import TodayRecordForm from "../components/TodayRecordForm";

export default function DiaryPage() {
  return (
    <RequireLogin>
      <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
        <TodayRecordForm />
      </main>
    </RequireLogin>
  );
}
