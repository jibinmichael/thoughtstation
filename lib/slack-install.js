const { connectToDatabase, COLLECTIONS, getInstallationQuery } = require('./database');
const { getEncryption } = require('./encryption');

class SlackInstallationStore {
  constructor() {
    this.encryption = getEncryption();
  }

  async storeInstallation(installation) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTIONS.INSTALLATIONS);

    // Encrypt sensitive tokens
    const encryptedInstallation = {
      ...installation,
      access_token: installation.access_token ? 
        this.encryption.encrypt(installation.access_token) : undefined,
      bot_access_token: installation.bot?.token ? 
        this.encryption.encrypt(installation.bot.token) : undefined,
      bot_user_id: installation.bot?.userId,
      app_id: installation.appId,
      team_id: installation.team?.id,
      enterprise_id: installation.enterprise?.id,
      user_id: installation.user?.id,
      installed_at: new Date(),
      updated_at: new Date()
    };

    // Remove unencrypted bot object
    delete encryptedInstallation.bot;

    const query = getInstallationQuery(
      installation.team?.id,
      installation.enterprise?.id
    );

    await collection.replaceOne(
      query,
      encryptedInstallation,
      { upsert: true }
    );

    console.log('✅ Installation stored for team:', installation.team?.id);
  }

  async fetchInstallation(installQuery) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTIONS.INSTALLATIONS);

    const query = getInstallationQuery(
      installQuery.teamId,
      installQuery.enterpriseId
    );

    const installation = await collection.findOne(query);

    if (!installation) {
      throw new Error('Installation not found');
    }

    // Decrypt tokens and format for Bolt
    return {
      team: { id: installation.team_id },
      enterprise: installation.enterprise_id ? { id: installation.enterprise_id } : undefined,
      bot: {
        token: this.encryption.decrypt(installation.bot_access_token),
        userId: installation.bot_user_id,
        id: installation.bot_user_id
      },
      user: {
        token: installation.access_token ? 
          this.encryption.decrypt(installation.access_token) : undefined,
        id: installation.user_id
      },
      appId: installation.app_id,
      tokenType: 'bot'
    };
  }

  async deleteInstallation(installQuery) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTIONS.INSTALLATIONS);

    const query = getInstallationQuery(
      installQuery.teamId,
      installQuery.enterpriseId
    );

    await collection.deleteOne(query);
    console.log('🗑️ Installation deleted for team:', installQuery.teamId);
  }
}

module.exports = { SlackInstallationStore }; 