import mongoose from 'mongoose';

const tgPostSchema = new mongoose.Schema({
  url: { type: String, required: true },
  tg_id: { type: String, required: true }
});

export default mongoose.models.TgPost || mongoose.model('TgPost', tgPostSchema);