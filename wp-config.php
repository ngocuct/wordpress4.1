<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link http://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress-4.1');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', '');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '6?h?&-QYwz0)Hji]^~%#l7JOc&a*p_06bBz0hL(y6FkA RNO6Z^~gNuZ#Y+Y4ezr');
define('SECURE_AUTH_KEY',  'H6[kp%bmt6P<jlAr0gdbgv6D{x!e[CNRK0Y}4!BUHBaPrA5`KWz_egrLor&g;YrQ');
define('LOGGED_IN_KEY',    '/#E+[F&i3DPg1n]=Y7J^(+py!I{g;A1vcY@M2-3To!u=[lri1L%DK6+2xC]K1b|&');
define('NONCE_KEY',        'k5oo>X4@>NmSmx.)0qGPLE^y=}n_Nql,R;2O4&skmk~l;&UG7_zCUGI8wF[ RQ~+');
define('AUTH_SALT',        'eIEkTT]L*wH2,!ke>N_fJ2?c@(Jds u4hy<e%Fuqfh1^( LJ>EEb6ToAPR|d}L}L');
define('SECURE_AUTH_SALT', 'ZtBSj~*ff7aZ=aOB9gAAjpyd;rv#>JnkAP0o9`9KiI9XipNk:R*^zhCER1@u5f@X');
define('LOGGED_IN_SALT',   '0C,%wb_[JA8]5kdS`4Xlm,pSfXsYtk1 6Ew5^9NXk%ul|D02(pT?U?vc_{7[x_zn');
define('NONCE_SALT',       '?-Rqbk=GD0%1S,7%y9mm2IHSabEyr32E{CM5mJ8*/IDBWMyM-b$r!;T6+1EQ`26N');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
