<?php
/*
Plugin Name: WP Media folder
Plugin URI: http://www.joomunited.com
Description: WP media Folder is a WordPress plugin that enhance the WordPress media manager by adding a folder manager inside.
Author: Joomunited
Version: 1.0.2
Author URI: http://www.joomunited.com
Licence : GNU General Public License version 2 or later; http://www.gnu.org/licenses/gpl-2.0.html
Copyright : Copyright (C) 2014 JoomUnited (http://www.joomunited.com). All rights reserved.
*/

// Prohibit direct script loading
defined( 'ABSPATH' ) || die( 'No direct script access allowed!' );

add_action('init', 'wpmf_session_start', 1);
 
function wpmf_session_start() {
   if ( ! session_id() ) {
      @session_start();
   }
}

function wpmf_load_custom_wp_admin_script() {
    global $pagenow;
    if ( $pagenow !== 'upload.php' && $pagenow !== 'post.php' && $pagenow !== 'post-new.php') {
	return;
    }
    if(($pagenow==='post.php' || $pagenow==='post-new.php') && !in_array(get_post_type(@(int)$_GET['post']),array('post','page'))){
	return;
    }
    wp_register_script('script', plugins_url( '/script.js', __FILE__ ));
    wp_enqueue_script('script');
}
add_action( 'admin_enqueue_scripts', 'wpmf_load_custom_wp_admin_script' );
    

if(!get_option('_wpmf_import_notice_flag', false)){
	add_action( 'admin_notices', 'wpmf_whow_notice', 3 );
}
function wpmf_whow_notice(){
	echo '<script type="text/javascript">'.PHP_EOL
		. 'function importWpmfTaxonomy(doit,button){'.PHP_EOL
		    .'jQuery(button).find(".spinner").show();'.PHP_EOL
		    .'jQuery.post(ajaxurl, {action: "wpmf_import",doit:doit}, function(response) {'.PHP_EOL
			.'jQuery("#wpmf_error").hide();'.PHP_EOL
			.'if(doit===true){'.PHP_EOL
			    .'jQuery("#wpmf_error").after("<div class=\'updated\'> <p><strong>Categories imported into WP Media Folder. Enjoy!!!</strong></p></div>");'.PHP_EOL
			.'}'.PHP_EOL
		    .'});'.PHP_EOL
		. '}'.PHP_EOL
	    . '</script>';
	echo '<div class="error" id="wpmf_error">'
		. '<p>'
		. 'You\'ve just installed WP Media Folder, to save your time we can import your media categories into WP Media Folder'
		    . '<a href="#" class="button button-primary" style="margin: 0 5px;" onclick="importWpmfTaxonomy(true,this);" id="wmpfImportBtn">Import categories now <span class="spinner"></span></a> or <a href="#" onclick="importWpmfTaxonomy(false,this);" style="margin: 0 5px;" class="button">No thanks <span class="spinner"></a>'
		. '</p>'
	    . '</div>';	    
}

add_action( 'wp_ajax_wpmf_import', 'wpmf_import_categories' );
function wpmf_import_categories(){
    if(get_option('_wpmf_import_notice_flag', false)){
	die();
    }
    if($_POST['doit']==='true'){
	$terms = get_terms( 'category', array(
			'orderby'       => 'name',
			'order'         => 'ASC',
			'hide_empty'    => false,
			'child_of'	=> 0
		) );
	
	$termsRel = array('0'=>0);
	foreach ($terms as $term) {
	    $inserted = wp_insert_term($term->name, 'wpmf-category',array('slug'=>wp_unique_term_slug($term->slug,$term)));
	    if ( is_wp_error($inserted) ) {
		wp_send_json($inserted->get_error_message());
	    }
	    $termsRel[$term->term_id] = $inserted['term_id'];
	}
	foreach ($terms as $term) {
	    wp_update_term($termsRel[$term->term_id], 'wpmf-category',array('parent'=>$termsRel[$term->parent]));
	}
	
	//update attachments
	$attachments = get_posts(array('posts_per_page'=>-1,'post_type'=>'attachment'));
	foreach ($attachments as $attachment) {
	    $terms = wp_get_post_terms($attachment->ID,'category');
	    $termsArray = array();
	    foreach ($terms as $term) {
		$termsArray[] = $termsRel[$term->term_id];
	    }
	    wp_set_post_terms( $attachment->ID, $termsArray, 'wpmf-category');
	}
    }
    update_option('_wpmf_import_notice_flag', true);
    die();
}

/** Register taxonomy for images */
function wpmf_register_taxonomy_for_images() {
    register_taxonomy('wpmf-category', 'attachment',array('hierarchical'=>true,'show_in_nav_menus'=>false,'show_ui'=>false));
}
add_action( 'init', 'wpmf_register_taxonomy_for_images' );

 /** Add a category filter to images */
function wpmf_add_image_category_filter() {
    global $pagenow;
    if ( $pagenow == 'upload.php' ) {
        $dropdown_options = array( 'show_option_all' => __( 'View all categories', 'wpmf' ), 'hide_empty' => false, 'hierarchical' => true, 'orderby' => 'name', 'taxonomy'=>'wpmf-category', 'class'=>'wpmf-categories', 'name' => 'wcat', 'selected' => (int)(isset($_GET['wcat'])?$_GET['wcat']:0) );
        wp_dropdown_categories( $dropdown_options );
    }
}
add_action( 'restrict_manage_posts', 'wpmf_add_image_category_filter' );

add_action('pre_get_posts', 'wpmf_pre_get_posts1');
function wpmf_pre_get_posts1($query){
    global $pagenow;
    if ( $pagenow == 'upload.php' ) {
	if(isset($_GET['wcat']) && (int)$_GET['wcat']!==0){
	    $query->tax_query->queries[] = array(
			'taxonomy' => 'wpmf-category',
			'field'    => 'term_id',
			'terms'    => (int)$_GET['wcat'],
			'include_children' => false
		);
	    $query->query_vars['tax_query'] = $query->tax_query->queries;
	}else{
	    $terms = get_categories(array('hide_empty'=>false,'taxonomy'=>'wpmf-category'));
	    $cats = array();
	    foreach ($terms as $term) {
		$cats[] = $term->term_id;
	    }
	    $query->tax_query->queries[] = array(
		    'taxonomy' => 'wpmf-category',
		    'field'    => 'term_id',
		    'terms'    => $cats,
		    'operator' => 'NOT IN',
		    'include_children' => false
		);
	    $query->query_vars['tax_query'] = $query->tax_query->queries;
	}
    }
}

add_action( 'admin_head', 'wpmf_admin_head' );

function wpmf_admin_head(){

	wp_enqueue_style('wpmf-style',plugins_url( '/style.css', __FILE__ ));   
        wp_enqueue_style('wpmf-jaofiletree',plugins_url( '/jaofiletree.css', __FILE__ ));
	$attachment_terms = array();

	$terms = get_categories(array('hide_empty'=>false,'taxonomy'=>'wpmf-category'));
	$terms = generatePageTree($terms);
	$terms = parent_sort($terms);
 
        $attachment_terms_order = array();
	$attachment_terms[] = array( 'id' => 0, 'label' => __('No') . ' Categories' , 'slug' => '' , 'parent_id' => 0);
        $attachment_terms_order[] = '0';
	foreach ( $terms as $term ){
	    $attachment_terms[$term->term_id] = array( 'id' => $term->term_id, 'label' => $term->name, 'slug' => $term->slug, 'parent_id' => $term->category_parent, 'depth'=>$term->depth );
            $attachment_terms_order[] = $term->term_id;
	}
 
	?>
	<script type="text/javascript">
	    wpmf_categories = <?php echo json_encode( $attachment_terms ) ?>; 
            wpmf_categories_order =  <?php echo json_encode( $attachment_terms_order ) ?>; 
 
	    wpmf_images_path = '<?php echo plugins_url( 'images', __FILE__ ) ?>';
	</script>
	<?php
	
	//include jquery ui
	wp_enqueue_script( array('jquery-ui-draggable','jquery-ui-droppable') );
}

function getRecursiveTerms($taxonomy,$term=0){
    $terms = get_terms( $taxonomy, array(
			'orderby'       => 'name',
			'order'         => 'ASC',
			'hide_empty'    => true,
			'child_of'	=> $term
		) );
    return $terms;
}

add_action( 'pre_get_posts', 'wpmf_pre_get_posts' , 0, 1 );


function wpmf_pre_get_posts( $query )
{
       if ( !isset( $query->query_vars['post_type'] ) || $query->query_vars['post_type'] != 'attachment' )
	       return;

       $taxonomies = apply_filters( 'attachment-category', get_object_taxonomies( 'attachment', 'objects' ) );
       if ( !$taxonomies ) return;
       foreach ( $taxonomies as $taxonomyname => $taxonomy ) :
	       if ( isset( $_REQUEST['query'][$taxonomyname] ) && $_REQUEST['query'][$taxonomyname]['term_slug'] ){    
		   $query->set('tax_query', array(
		       array(
			   'taxonomy' => $taxonomyname,
			   'field' => 'slug',
			   'terms' => $_REQUEST['query'][$taxonomyname]['term_slug'],
			   'include_children' => false
			   )
		       )
		   );
	       }elseif ( isset( $_REQUEST[$taxonomyname] ) && is_numeric( $_REQUEST[$taxonomyname] ) && intval( $_REQUEST[$taxonomyname] ) != 0 ){
		       $term = get_term_by( 'id', $_REQUEST[$taxonomyname], $taxonomyname );
		       if ( is_object( $term ) )
			       set_query_var( $taxonomyname, $term->slug );
	       }elseif(isset( $_REQUEST['query'][$taxonomyname] ) && $_REQUEST['query'][$taxonomyname]['term_slug'] == ''){
		    $terms = get_terms($taxonomyname,array('hide_empty'=>false,'hierarchical'=>false));
		    $unsetTags = array();
		    foreach ($terms as $term){
			$unsetTags[] = $term->slug;
		    }
		    $query->set('tax_query', array(
			    array(
				'taxonomy' => $taxonomyname,
				'field' => 'slug',
				'terms' => $unsetTags,
				'operator' => 'NOT IN',
				'include_children' => false
				)
			    )
			);
	       }

       endforeach;
   return $query;
}
	
//add_filter( 'the_posts','wpmf_post_results'  );
function wpmf_post_results($posts){   
    if (defined('DOING_AJAX') && DOING_AJAX && $_REQUEST['action']==='query-attachments') {
	if ( isset( $_REQUEST['query']['category'] ) ){
	    $parent = $_REQUEST['query']['category']['term_id'];
	}else{
	    $parent = 0;
	}
	$terms = get_terms( 'wpmf-category', array(
			    'orderby'       => 'name',
			    'order'         => 'ASC',
			    'parent'	    => $parent,
			    'hide_empty'    => false
			    )
			);
	$ij = 1;
	if(!empty($terms)){
	    foreach ($terms as $term) {
		$post = new stdClass();
		$post->ID = -$ij;
		$post->comment_count = 0;
		$post->comment_status = 'open';
		$post->filter = 'raw';
		$post->guid = $term->name;
		$post->menu_order = 0;
		$post->ping_status = 'open';
		$post->pinged = '';
		$post->post_author = '1';
		$post->post_content = $term->name;
		$post->post_content_filtered = '';
		$post->post_date = '2014-10-02 03:49:36';
		$post->post_date_gmt = '2014-10-02 03:49:36';
		$post->post_excerpt = '';
		$post->post_mime_type = 'application/xxx-folder';
		$post->post_modified = '2014-10-02 03:49:36';
		$post->post_modified_gmt = '2014-10-02 03:49:36';
		$post->post_name = $term->slug;
		$post->post_parent = 0;
		$post->post_password = '';
		$post->post_status = 'inherit';
		$post->post_title = $term->name;
		$post->post_type = 'attachment';
		$post->to_ping = '';
		$post = new WP_Post($post);
		$ij++;
	    }	
	}
	array_splice($posts, 40);
    }
    return $posts;
}

add_action('wp_ajax_change_folder','wpmf_change_folder');
function wpmf_change_folder(){    
    $id = (int)$_POST['id'] | 0;
    $_SESSION['wpmf-current-folder'] = $id;
}


/* */
function wpmf_after_upload($metadata, $attachment_id) {
    $parent = (int)$_SESSION['wpmf-current-folder'];
    if($parent){
	wp_set_object_terms($attachment_id,$parent,'wpmf-category',true);
    }
    return $metadata;
}
add_filter( 'wp_generate_attachment_metadata', 'wpmf_after_upload', 10, 2 );

/** Add a new folder via ajax **/
add_action('wp_ajax_add_folder','wpmf_add_folder');
function wpmf_add_folder(){
    if(isset($_POST['name']) && $_POST['name']){
	$term = esc_attr($_POST['name']);
    }else{
	$term = 'New folder';
    }
    $termParent = (int)$_POST['parent'] | 0;
    $inserted = wp_insert_term($term, 'wpmf-category',array('parent'=>$termParent));
    if ( is_wp_error($inserted) ) {
	// oops WP_Error obj returned, so the term existed prior
	wp_send_json($inserted->get_error_message());
    }
    $termInfos = get_term($inserted['term_id'],'wpmf-category');
    wp_send_json($termInfos);
}


/** Edit folder via ajax **/
add_action('wp_ajax_edit_folder','wpmf_edit_folder');
function wpmf_edit_folder(){
    $term = esc_attr($_POST['name']);
    if(!$term){
	return;
    }     
    //check duplicate name
    $siblings = get_terms('wpmf-category', array('fields' => 'names', 'get' => 'all', 'parent' => (int)$_POST['parent_id']));
    if (in_array($term, $siblings)) {
        return wp_send_json(false);
    }
    $termInfos = wp_update_term((int)$_POST['id'],'wpmf-category',array('name'=>$term));     
     if($termInfos instanceof WP_Error){
	wp_send_json($termInfos->get_error_messages());
    }else{
	 $termInfos = get_term($termInfos['term_id'],'wpmf-category');
        wp_send_json($termInfos);
    }    
//   
}

/** Edit folder via ajax **/
add_action('wp_ajax_delete_folder','wpmf_delete_folder');
function wpmf_delete_folder(){    
    $childs = get_term_children((int)$_POST['id'],'wpmf-category');
    if(is_array($childs) && count($childs)>0){
	wp_send_json('not empty');
    }else{
	wp_send_json(wp_delete_term((int)$_POST['id'],'wpmf-category'));
    }
}

/** Move a file via ajax **/
add_action('wp_ajax_move_file','wpmf_move_file');
function wpmf_move_file(){
    $return = true;
    $ids = explode(',', $_POST['ids']);
    foreach ($ids as $id){
	wp_delete_object_term_relationships((int)$id, 'wpmf-category');
	if((int)$_POST['id_category'] === 0 || wp_set_object_terms((int)$id,(int)$_POST['id_category'],'wpmf-category',true)){
	    
	}else{
	    $return = false;
	}
    }
    wp_send_json($return);
}

/** Move a folder via ajax **/
add_action('wp_ajax_move_folder','wpmf_move_folder');
function wpmf_move_folder(){
    //check duplicate name
    $term = esc_attr($_POST['name']);
    $siblings = get_terms('wpmf-category', array('fields' => 'names', 'get' => 'all', 'parent' => (int)$_POST['id_category']));
    if (in_array($term, $siblings)) {
        return wp_send_json(false);
    }
    
    $r = wp_update_term((int)$_POST['id'],'wpmf-category',array('parent'=>(int)$_POST['id_category']));
    if($r instanceof WP_Error){
	wp_send_json(false);
    }else{
	wp_send_json(true);
    }    
}

function generatePageTree($datas, $parent = 0, $depth=0, $limit=0){
	if($limit > 1000) return ''; // Make sure not to have an endless recursion
	$tree = array();
	for($i=0, $ni=count($datas); $i < $ni; $i++){
	    if($datas[$i]->parent == $parent){
		//$datas[$i]->name = str_repeat('&nbsp;&nbsp;',$depth).$datas[$i]->name;
		$datas[$i]->name = $datas[$i]->name;
		$datas[$i]->depth = $depth;
		$tree[] = $datas[$i];
		$t = generatePageTree($datas, $datas[$i]->term_id, $depth+1, $limit++);
		    $tree = array_merge($tree,$t);
	    }
	}
	return $tree;
}

/**
 * sort parents before children
 * http://stackoverflow.com/questions/6377147/sort-an-array-placing-children-beneath-parents
 *
 * @param array   $objects input objects with attributes 'id' and 'parent'
 * @param array   $result  (optional, reference) internal
 * @param integer $parent  (optional) internal
 * @param integer $depth   (optional) internal
 * @return array           output
 */
function parent_sort(array $objects, array &$result=array(), $parent=0, $depth=0) {
    foreach ($objects as $key => $object) {
        if ($object->parent == $parent) {
            $object->depth = $depth;
            array_push($result, $object);
            unset($objects[$key]);
            parent_sort($objects, $result, $object->term_id, $depth + 1);
        }
    }
    return $result;
}

//Folder tree
add_action('wp_ajax_get_terms','wpmf_get_terms');
function wpmf_get_terms(){
    $dir = '/';
    if (!empty($_GET['dir'])) {
        $dir = $_GET['dir'];
        if ($dir[0] == '/') {
            $dir = '.' . $dir . '/';
        }
    }
    $dir = str_replace('..', '', $dir);
    $root = dirname(__FILE__) . '/../';
    $dirs = $fi = array();
    $id = (int)$_GET['id'];
    $files = get_terms( 'wpmf-category', array('orderby'=> 'id','order'=> 'ASC','parent'=> $id,'hide_empty'=> false));	       
    foreach ($files as $file) {
             $dirs[] = array('type' => 'dir', 'dir' => $dir, 'file' => $file->name ,'id' => $file->term_id,'parent_id' => $file->parent);
    }
  
    if(count($dirs)<0){
        wp_send_json('not empty');
    }else{
        wp_send_json($dirs);
    }
}