import { Settings } from '../models/Settings.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        contactPhone: '+91 86974 49885',
        whatsappNumber: '918697449885',
        shippingFee: 69,
        freeShippingThreshold: 999,
        codEnabled: true,
      });
    }
    res.status(200).json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const {
      contactPhone,
      whatsappNumber,
      supportEmail,
      shippingFee,
      freeShippingThreshold,
      codEnabled,
      announcementText,
    } = req.body;

    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (codEnabled !== undefined) settings.codEnabled = Boolean(codEnabled);
    if (announcementText !== undefined) settings.announcementText = announcementText;

    await settings.save();
    res.status(200).json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
};

