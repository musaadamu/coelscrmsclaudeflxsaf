const AuditLog = require('../models/auditLog.model')
const { asyncContext } = require('./asyncContext')

function auditPlugin(schema) {
  schema.post('save', async function (doc) {
    try {
      const context = asyncContext.getStore() || {}
      if (!context?.userId) return
      await AuditLog.create({
        collectionName: doc.collection.name,
        documentId: doc._id,
        action: this.isNew ? 'CREATE' : 'UPDATE',
        newValues: doc.toObject ? doc.toObject() : doc,
        performedBy: context.userId,
        ipAddress: context.ip,
        userAgent: context.userAgent,
      })
    } catch (e) {
      // swallow
      console.error('auditPlugin save error', e)
    }
  })

  schema.post('findOneAndUpdate', async function (doc) {
    try {
      const context = asyncContext.getStore() || {}
      if (!context?.userId) return
      if (!doc) return
      await AuditLog.create({
        collectionName: doc.collection.name,
        documentId: doc._id,
        action: 'UPDATE',
        newValues: doc.toObject ? doc.toObject() : doc,
        performedBy: context.userId,
        ipAddress: context.ip,
        userAgent: context.userAgent,
      })
    } catch (e) {
      console.error('auditPlugin findOneAndUpdate error', e)
    }
  })

  schema.post('findOneAndDelete', async function (doc) {
    try {
      const context = asyncContext.getStore() || {}
      if (!context?.userId) return
      if (!doc) return
      await AuditLog.create({
        collectionName: doc.collection.name,
        documentId: doc._id,
        action: 'DELETE',
        newValues: doc.toObject ? doc.toObject() : doc,
        performedBy: context.userId,
        ipAddress: context.ip,
        userAgent: context.userAgent,
      })
    } catch (e) {
      console.error('auditPlugin findOneAndDelete error', e)
    }
  })
}

module.exports = auditPlugin
