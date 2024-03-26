import { json } from "react-router-dom";

<script type="text/javascript">
    var_api_error_list = new Array();
    function callApiR02(json_data, redirect_url, msg, exec_time){
        data_post = JSON.parse(json_data);
    show_json_api = "<?php echo Yii::app()->params['show_json_api']?>";
    $.blockUI();
    $.ajax({
        type: "POST",
    url: "<?php echo Yii::app()->params['realmotor_url'];?>",
    dataType: "jsonp",
    data: data_post,
    success: function(data) {
            var ret_text = data['ret_text'].replace(/\n/g, "<br>");
        var ret = "<strong><?php echo Yii::t('msg', 'api.error');?></strong><br>";
            if (data['ret'] == true) {
                ret = "<strong><?php echo Yii::t('msg', 'api.ok');?></strong><br>";
            ret_text = ret+ret_text;
            showMessageSuccess();
            $("#message-success .result").html(ret);
            }else{
                msg = "<strong>" + msg + "</strong><br>";
            ret_text = msg + data_post.reference_no +": "+ ret+ret_text;
            $('#message-api').show();
            $("#message-api .api-result").html(ret_text);
            if(show_json_api=="1"){
                $("#message-api .api-json").html(json_data);
                }
            }
            updateData = {
                'car_id':data_post.stock_id,
            'stock_no':$("#TCarInfo_stock_no").val(),
            'exec_time':exec_time,
            'json_val':json_data,
            'ret':data['ret'],
            'ret_text':data['ret_text']
};
            frm_load = "#search-form";
            callUpdateApi(updateData, frm_load);
            setTimeout(function() {
                $.unblockUI(); );
}, 5000); ?>
},
            error: function(XMLHttpRequest, textStatus, errorThrown) {
//alert(textStatus);
//2015.02.25 #10611 update api_history
var errMsg = XMLHttpRequest.status + "; " + errorThrown + ";" + XMLHttpRequest.responseText;
            updateData = {
                'car_id':data_post.stock_id,
            'stock_no':data_post.stock_no,
            'exec_time':exec_time,
            'json_val':json_data,
            'ret':'0',
            'ret_text':errMsg
};
            callUpdateApi(updateData);
            $.unblockUI();
}
});
}
        </script>




        <?php
        return array(
sender'=>array('mail'=>'mailkisdev@gmail.com','alias'=>'KIS'),
tokenkey' => '0iXRkSCDfNwO', // 本番環境: a9zx8oZWwkK
'api_renkei_flag' => 0,
'show_json_api' => 0, //1: show json, 0: no show
'api_delay' => 50, //1000 ms = 1 second.
// === 商談サイト連携 (cron flag on/off)
'sales_job_import_flag' => 0, // 1: run process, 0: stop process
/*--------------------JP dev (開発環境)-------------------*/
'realmotor_url' => 'http://control-dev.realmotor.jp/vehicle_update/',
'ftp_info' => array(
    'domain_url' => 'control-dev.realmotor.jp',
    'folder'=>'/',
    'user_login'=>'rmj-jackall-dev',
    'password'=>'od7hIcWkz3',
    'upload_dir'=>'/vehicle_state',
        );


?>