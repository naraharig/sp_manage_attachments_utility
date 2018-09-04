var App = angular.module("App", []);

 App.controller("AttachmentsController",function($scope){
 
 	$scope.ReportAttachments = [];
  $scope.RequesterLoadedAttachments = [];
  $scope.ReportAttachmentsDeleted = [];
      
      
	
  
  SPUtility.HandleFileUploadFunctionality($scope.ReportAttachments, 'btn_Report_Attach', 'fileCntrl_Report', 'ULReportAttachments');
     
	SPUtility.handleDeleteExistingFilesClick('ULReportAttachments', $scope.ReportLoadedAttachments, $scope.ReportAttachmentsDeleted);
 
 
 $scope.onSubmit = function(){
 
  if ($scope.RequesterAttachments && $scope.RequesterAttachments.length > 0) {
                SPUtility.uploadItemAttachments($scope.RequesterAttachments, CONST.lstPJRequests, curItemID, uploadDocumentsCompleted, '-NEWREQDOCS_-')
        }
 
 }
 
 });
