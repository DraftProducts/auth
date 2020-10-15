/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServerContract } from '@ioc:Adonis/Core/Server'
import { AuthManagerContract } from '@ioc:Adonis/Addons/Auth'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Auth provider to register the auth binding
 */
export default class AuthProvider {
	constructor(protected application: ApplicationContract) {}
	public static needsApplication = true

	/**
	 * Register auth binding
	 */
	public register() {
		this.application.container.singleton('Adonis/Addons/Auth', () => {
			const authConfig = this.application.container.use('Adonis/Core/Config').get('auth', {})
			const { AuthManager } = require('../src/AuthManager')
			return new AuthManager(this.application, authConfig)
		})
	}

	/**
	 * Hook into boot to register auth macro
	 */
	public async boot() {
		this.application.container.with(
			['Adonis/Core/HttpContext', 'Adonis/Addons/Auth'],
			(HttpContext: HttpContextConstructorContract, Auth: AuthManagerContract) => {
				HttpContext.getter(
					'auth',
					function auth() {
						return Auth.getAuthForRequest(this)
					},
					true
				)
			}
		)

		this.application.container.with(
			['Adonis/Core/Server', 'Adonis/Core/View'],
			(Server: ServerContract) => {
				Server.hooks.before(async (ctx) => {
					ctx['view'].share({ auth: ctx.auth })
				})
			}
		)
	}
}
