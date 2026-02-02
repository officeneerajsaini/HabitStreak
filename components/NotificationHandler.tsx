// components/NotificationHandler.tsx

import { useRoutine } from "@/context/RoutineContext";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import ReportPopup from "./ReportPopup";
import {
  setupNotificationResponseListener,
  setupNotificationListener,
} from "../services/notificationService";

export default function NotificationHandler() {
  const { markReportPending, pendingReports, removePendingReport } = useRoutine();
  const [currentReport, setCurrentReport] = useState<{
    routineId: string;
    routineTitle: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    // Handle notification received (when app is in foreground)
    const receivedSubscription = setupNotificationListener((notification) => {
      const data = notification.request.content.data;
      
      if (data.type === "routine-report") {
        markReportPending(
          data.routineId,
          data.routineTitle,
          data.date
        );
        // Show popup immediately if app is open
        setCurrentReport({
          routineId: data.routineId,
          routineTitle: data.routineTitle,
          date: data.date,
        });
      }
    });

    // Handle notification response (when user taps notification)
    const responseSubscription = setupNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data.type === "routine-report") {
        markReportPending(
          data.routineId,
          data.routineTitle,
          data.date
        );
        setCurrentReport({
          routineId: data.routineId,
          routineTitle: data.routineTitle,
          date: data.date,
        });
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [markReportPending]);

  // Show the first pending report when there are pending reports and no current report
  useEffect(() => {
    if (pendingReports.length > 0 && !currentReport) {
      const firstPending = pendingReports[0];
      setCurrentReport(firstPending);
    } else if (pendingReports.length === 0 && currentReport) {
      // If no pending reports, clear current report
      setCurrentReport(null);
    }
  }, [pendingReports, currentReport]);

  const handleClose = () => {
    const current = currentReport;
    setCurrentReport(null);
    
    // After a delay, check if there are more pending reports (excluding the one we just closed)
    setTimeout(() => {
      const remainingPending = pendingReports.filter(
        p => !(current && p.routineId === current.routineId && p.date === current.date)
      );
      if (remainingPending.length > 0) {
        setCurrentReport(remainingPending[0]);
      }
    }, 500);
  };

  if (!currentReport) return null;

  return (
    <ReportPopup
      visible={true}
      routineId={currentReport.routineId}
      routineTitle={currentReport.routineTitle}
      date={currentReport.date}
      onClose={handleClose}
    />
  );
}
