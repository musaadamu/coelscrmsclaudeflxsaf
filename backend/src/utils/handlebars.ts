import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import logger from './logger'

export class HandlebarsService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map()

  constructor() {
    this.loadTemplates()
  }

  private loadTemplates(): void {
    const templatesDir = path.join(process.cwd(), 'templates')

    try {
      const files = fs.readdirSync(templatesDir)

      files.forEach((file) => {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '')
          const templatePath = path.join(templatesDir, file)
          const templateContent = fs.readFileSync(templatePath, 'utf-8')
          const compiled = Handlebars.compile(templateContent)

          this.templates.set(templateName, compiled)
          logger.debug(`Loaded template: ${templateName}`)
        }
      })

      logger.info(`Loaded ${this.templates.size} email templates`)
    } catch (error) {
      logger.error('Failed to load templates:', error)
    }
  }

  compile(templateName: string, context: Record<string, any>): string {
    const template = this.templates.get(templateName)

    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    return template(context)
  }
}

export const handlebarsService = new HandlebarsService()
