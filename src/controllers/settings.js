import settings from "../models/settings.js";

// Get current settings
export const getSettings = async (req, res) => {
  try {
    let currentSettings = await settings.findOne().sort({ createdAt: -1 });
    if (!currentSettings) {
      currentSettings = new settings();
      await currentSettings.save();
    }
    res.status(200).json(currentSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      schoolName,
      defaultElectionDuration,
      maxCandidatesPerElection,
      sessionTimeout,
      enableEmailNotifications,
    } = req.body;

    let currentSettings = await settings.findOne().sort({ createdAt: -1 });
    if (!currentSettings) currentSettings = new settings();

    if (schoolName !== undefined) currentSettings.schoolName = schoolName;
    if (defaultElectionDuration !== undefined)
      currentSettings.defaultElectionDuration = defaultElectionDuration;
    if (maxCandidatesPerElection !== undefined)
      currentSettings.maxCandidatesPerElection = maxCandidatesPerElection;
    if (sessionTimeout !== undefined) currentSettings.sessionTimeout = sessionTimeout;
    if (enableEmailNotifications !== undefined)
      currentSettings.enableEmailNotifications = enableEmailNotifications;

    await currentSettings.save();
    res.status(200).json(currentSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};



// Reset settings to default
export const resetSettings = async (req, res) => {
  try {
    const defaultSettings = new settings();
    await settings.deleteMany({});
    await defaultSettings.save();
    res.status(200).json(defaultSettings);
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({ message: "Failed to reset settings" });
  }
};