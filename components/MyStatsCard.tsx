import { useTracker } from "@/context/TrackerContext";
import {
    eachDayOfInterval,
    endOfYear,
    format,
    isAfter,
    startOfDay,
    startOfYear,
} from "date-fns";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function MyStatsCard() {
  const { trackedHabits, getProgress } = useTracker();
  const [loading, setLoading] = useState<string | null>(null);

  const today = startOfDay(new Date());
  const currentYear = today.getFullYear();

  // Generate Yearly Overview PDF
  const generateYearlyPDF = async () => {
    try {
      setLoading("yearly");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const yearStart = startOfYear(today);
      const yearEnd = endOfYear(today);
      const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

      // Calculate stats
      let totalDays = 0;
      let perfectDays = 0;
      let totalProgress = 0;

      allDays.forEach((day) => {
        if (!isAfter(day, today)) {
          totalDays++;
          const progress = getProgress(format(day, "yyyy-MM-dd"));
          totalProgress += progress;
          if (progress === 100) perfectDays++;
        }
      });

      const avgProgress = totalDays > 0 ? Math.round(totalProgress / totalDays) : 0;

      // Generate HTML for PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>My ${currentYear} Habit Tracking Report</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #333;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 {
              color: #667eea;
              text-align: center;
              font-size: 36px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              font-size: 18px;
              margin-bottom: 40px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .stat-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 25px;
              border-radius: 15px;
              text-align: center;
              color: white;
            }
            .stat-value {
              font-size: 48px;
              font-weight: bold;
              margin: 10px 0;
            }
            .stat-label {
              font-size: 14px;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .habits-section {
              margin-top: 40px;
            }
            .habits-title {
              font-size: 24px;
              color: #667eea;
              margin-bottom: 20px;
              border-bottom: 3px solid #667eea;
              padding-bottom: 10px;
            }
            .habit-item {
              padding: 15px;
              margin: 10px 0;
              background: #f8f9fa;
              border-radius: 10px;
              border-left: 5px solid #667eea;
              display: flex;
              align-items: center;
              font-size: 16px;
            }
            .habit-emoji {
              font-size: 24px;
              margin-right: 15px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #999;
              font-size: 12px;
              padding-top: 20px;
              border-top: 2px solid #eee;
            }
            .emoji-large {
              font-size: 60px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎯 ${currentYear} Habit Report</h1>
            <p class="subtitle">Your Year in Review</p>

            <div class="emoji-large">
              ${avgProgress >= 80 ? "🏆" : avgProgress >= 60 ? "⭐" : avgProgress >= 40 ? "💪" : "🌱"}
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${perfectDays}</div>
                <div class="stat-label">Perfect Days</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${avgProgress}%</div>
                <div class="stat-label">Avg Progress</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${totalDays}</div>
                <div class="stat-label">Days Tracked</div>
              </div>
            </div>

            <div class="habits-section">
              <h2 class="habits-title">📋 Tracked Habits</h2>
              ${trackedHabits.map(habit => `
                <div class="habit-item">
                  <span class="habit-emoji">${habit.emoji}</span>
                  <span>${habit.title}</span>
                </div>
              `).join('')}
            </div>

            <div class="footer">
              <p>Generated on ${format(today, "MMMM dd, yyyy")}</p>
              <p>Keep up the great work! 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `My ${currentYear} Habit Report`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Success", "PDF saved to device!");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Generate Heatmap Data PDF
  const generateHeatmapPDF = async () => {
    try {
      setLoading("heatmap");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const yearStart = startOfYear(today);
      const yearEnd = endOfYear(today);
      const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

      // Generate heatmap data
      const heatmapData = allDays
        .filter(day => !isAfter(day, today))
        .map(day => {
          const dateKey = format(day, "yyyy-MM-dd");
          const progress = getProgress(dateKey);
          return {
            date: format(day, "MMM dd"),
            progress,
            color: progress === 100 ? "#4CAF50" : progress >= 75 ? "#8BC34A" : progress >= 50 ? "#FFC107" : progress > 0 ? "#FF9800" : "#DDDDDD"
          };
        });

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      allDays.forEach(day => {
        if (!isAfter(day, today)) {
          const progress = getProgress(format(day, "yyyy-MM-dd"));
          if (progress === 100) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
      });

      // Check current streak from today backwards
      let checkDate = today;
      while (checkDate >= yearStart) {
        const progress = getProgress(format(checkDate, "yyyy-MM-dd"));
        if (progress === 100) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>My ${currentYear} Activity Heatmap</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 {
              color: #11998e;
              text-align: center;
              font-size: 36px;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            .streak-cards {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 30px 0;
            }
            .streak-card {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              padding: 25px;
              border-radius: 15px;
              text-align: center;
              color: white;
            }
            .streak-value {
              font-size: 48px;
              font-weight: bold;
              margin: 10px 0;
            }
            .streak-label {
              font-size: 14px;
              opacity: 0.9;
            }
            .heatmap-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 5px;
              margin: 30px 0;
            }
            .heatmap-cell {
              aspect-ratio: 1;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #666;
            }
            .legend {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin: 20px 0;
              font-size: 12px;
              color: #666;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .legend-box {
              width: 15px;
              height: 15px;
              border-radius: 3px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔥 ${currentYear} Activity</h1>
            <p class="subtitle">Your completion heatmap</p>

            <div class="streak-cards">
              <div class="streak-card">
                <div class="streak-value">🔥 ${currentStreak}</div>
                <div class="streak-label">Current Streak</div>
              </div>
              <div class="streak-card">
                <div class="streak-value">⭐ ${longestStreak}</div>
                <div class="streak-label">Longest Streak</div>
              </div>
            </div>

            <div class="legend">
              <div class="legend-item">
                <div class="legend-box" style="background: #DDDDDD;"></div>
                <span>0%</span>
              </div>
              <div class="legend-item">
                <div class="legend-box" style="background: #FF9800;"></div>
                <span>1-49%</span>
              </div>
              <div class="legend-item">
                <div class="legend-box" style="background: #FFC107;"></div>
                <span>50-74%</span>
              </div>
              <div class="legend-item">
                <div class="legend-box" style="background: #8BC34A;"></div>
                <span>75-99%</span>
              </div>
              <div class="legend-item">
                <div class="legend-box" style="background: #4CAF50;"></div>
                <span>100%</span>
              </div>
            </div>

            <div class="heatmap-grid">
              ${heatmapData.map(day => `
                <div class="heatmap-cell" style="background: ${day.color};">
                  ${day.progress > 0 ? day.progress + '%' : ''}
                </div>
              `).join('')}
            </div>

            <div class="footer">
              <p>Generated on ${format(today, "MMMM dd, yyyy")}</p>
              <p>Total days: ${heatmapData.length} | Keep going! 💪</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `My ${currentYear} Activity Heatmap`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Success", "PDF saved to device!");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error generating heatmap:", error);
      Alert.alert("Error", "Failed to generate heatmap. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 My Stats</Text>
      <Text style={styles.subtitle}>Share your progress with others</Text>

      <View style={styles.buttonsContainer}>
        {/* Yearly Report Button */}
        <Pressable
          style={[styles.shareButton, styles.yearlyButton]}
          onPress={generateYearlyPDF}
          disabled={loading !== null}
        >
          {loading === "yearly" ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.shareEmoji}>📅</Text>
              <Text style={styles.shareButtonText}>Share Yearly Report</Text>
              <Text style={styles.shareButtonSubtext}>
                {currentYear} overview with stats
              </Text>
            </>
          )}
        </Pressable>

        {/* Heatmap Button */}
        <Pressable
          style={[styles.shareButton, styles.heatmapButton]}
          onPress={generateHeatmapPDF}
          disabled={loading !== null}
        >
          {loading === "heatmap" ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.shareEmoji}>🔥</Text>
              <Text style={styles.shareButtonText}>Share Activity Heatmap</Text>
              <Text style={styles.shareButtonSubtext}>
                Your {currentYear} completion map
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <Text style={styles.hint}>
        💡 Tap any button to generate and share a PDF report
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },

  buttonsContainer: {
    gap: 16,
  },

  shareButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  yearlyButton: {
    backgroundColor: "#667eea",
  },

  heatmapButton: {
    backgroundColor: "#11998e",
  },

  shareEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  shareButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  shareButtonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
  },

  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});